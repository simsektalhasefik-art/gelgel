import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {
  centerLatitude: number;
  centerLongitude: number;
  pinLatitude?: number | null;
  pinLongitude?: number | null;
  radius?: number;
  // true: konum seçme modu. Haritanın tam ortasında sabit bir iğne durur (bkz. PickerMap
  // sarmalayıcısı), kullanıcı haritayı sürükleyerek konumu altına getirir — dokunup iğne
  // bırakmaya çalışmaz, böylece "sürükle mi tıkladı mı" belirsizliği (WebView içinde
  // dokunma hassasiyeti düşük) tamamen ortadan kalkar.
  // false: sabit bir yeri gösterir (bkz. pinLatitude/pinLongitude), kullanıcı sadece bakmak
  // için haritayı gezdirebilir (pannable).
  interactive?: boolean;
  pannable?: boolean;
  onCenterChange?: (coords: { latitude: number; longitude: number }) => void;
};

// Google Haritalar (react-native-maps) Android'de ücretsiz planda bile kredi kartlı
// bir API anahtarı istiyor; proje kuralı "kart veya ücretli anahtar isteyen bir harita
// servisi kullanılmaz" dediği için bunun yerine ücretsiz OpenStreetMap kaplamaları ve
// Leaflet (WebView içinde) kullanıyoruz. Anahtar gerekmez, iOS ve Android'de aynı görünür.
function buildHtml(
  lat: number,
  lng: number,
  pickerMode: boolean,
  pannable: boolean,
  radius: number,
  initialPin: { lat: number; lng: number } | null
) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #FFF8F2; }
    .leaflet-control-attribution { font-size: 9px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var pickerMode = ${pickerMode ? 'true' : 'false'};
    var canPan = ${pannable ? 'true' : 'false'};
    var map = L.map('map', {
      zoomControl: canPan,
      dragging: canPan,
      scrollWheelZoom: canPan,
      doubleClickZoom: false,
      touchZoom: canPan,
      attributionControl: true
    }).setView([${lat}, ${lng}], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    var marker = null;
    var circle = null;

    function drawCircle(lat, lng) {
      if (circle) map.removeLayer(circle);
      circle = L.circle([lat, lng], {
        radius: ${radius},
        color: '#C2381F',
        weight: 2,
        fillColor: '#EF5B45',
        fillOpacity: 0.18
      }).addTo(map);
    }

    function setPin(lat, lng) {
      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lng]).addTo(map);
      drawCircle(lat, lng);
    }

    if (pickerMode) {
      drawCircle(${lat}, ${lng});
      map.on('moveend', function () {
        var c = map.getCenter();
        drawCircle(c.lat, c.lng);
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'centerMoved', lat: c.lat, lng: c.lng }));
      });
    } else {
      var initialPin = ${initialPin ? JSON.stringify(initialPin) : 'null'};
      if (initialPin) {
        setPin(initialPin.lat, initialPin.lng);
      }
    }

    function handleMessage(event) {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'setPin') {
          setPin(data.lat, data.lng);
        } else if (data.type === 'panTo') {
          map.setView([data.lat, data.lng], data.zoom || map.getZoom());
        }
      } catch (e) {}
    }
    document.addEventListener('message', handleMessage);
    window.addEventListener('message', handleMessage);

    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
  </script>
</body>
</html>`;
}

export function LeafletMap({
  centerLatitude,
  centerLongitude,
  pinLatitude,
  pinLongitude,
  radius = 100,
  interactive = false,
  pannable = true,
  onCenterChange,
}: Props) {
  const webRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);

  const hasInitialPin = pinLatitude != null && pinLongitude != null;
  const initialLat = pinLatitude ?? centerLatitude;
  const initialLng = pinLongitude ?? centerLongitude;
  // HTML sadece bir kez üretilir: ilk konum doğrudan sayfaya gömülür, böylece WebView'in
  // sayfayı yüklemesini beklemeye (ve o ilk mesajı kaçırma riskine) gerek kalmaz.
  const html = useMemo(
    () =>
      buildHtml(
        initialLat,
        initialLng,
        interactive,
        pannable,
        radius,
        hasInitialPin ? { lat: initialLat, lng: initialLng } : null
      ),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Sonraki değişiklikler (adres arama, konum merkezleme) sayfa gerçekten yüklenip
  // mesaj dinleyicisi hazır olana kadar gönderilmez; erken gönderilen mesajlar kaybolur.
  useEffect(() => {
    if (!ready) return;
    if (interactive) {
      // Seçim modunda "konum" haritanın merkezidir; oraya kaydırmak yeterli,
      // moveend zaten yeni merkezi bize geri bildirir.
      webRef.current?.postMessage(JSON.stringify({ type: 'panTo', lat: centerLatitude, lng: centerLongitude, zoom: 16 }));
    } else {
      webRef.current?.postMessage(JSON.stringify({ type: 'panTo', lat: centerLatitude, lng: centerLongitude, zoom: 15 }));
      if (pinLatitude != null && pinLongitude != null) {
        webRef.current?.postMessage(JSON.stringify({ type: 'setPin', lat: pinLatitude, lng: pinLongitude }));
      }
    }
  }, [ready, interactive, centerLatitude, centerLongitude, pinLatitude, pinLongitude]);

  return (
    <View style={styles.wrap}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'ready') {
              setReady(true);
            } else if (data.type === 'centerMoved' && onCenterChange) {
              onCenterChange({ latitude: data.lat, longitude: data.lng });
            }
          } catch {
            // yoksay
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

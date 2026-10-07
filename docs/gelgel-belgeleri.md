# Gelgel – Uygulama Belgeleri

## Amaç, açık kararlar ve varsayımlar

Bu belge, kodlamaya başlamadan önce Claude Code'a verilecek altı belgeyi tek yerde toplar. Her faz ayrı bir Claude Code sohbetinde, sadece ilgili bölümler verilerek geliştirilir. Uygulamanın adı Gelgel, sloganı "Geliyo musun?".

Uygulama, arkadaş gruplarının ve STK ekiplerinin mutat buluşmalarına (sohbet, gönüllülük günü) katılımı takip eder. Geçerli mazereti olmadan gelmeyene ekibe ikram (tatlı, yemek ya da grubun belirlediği başka bir şey) ya da STK projesine bağış borcu düşer. Borç, fotoğraf veya dekontla kapatılır.

**Açık kararlar**

- [ ] Pilot grubun son dört buluşmasındaki katılım oranını ölç (başlangıç değeri).
- [ ] Apple Developer hesabı kişisel mi, STK kurumsal adına mı açılacak? (Kurumsal hesap D-U-N-S numarası ister, birkaç hafta sürebilir.)
- [ ] Gelgel adı için TÜRKPATENT, App Store ve alan adı kontrolü.

**Varsayımlar (pilotla doğrulanacak)**

- Kullanıcıların çoğu iPhone kullanıyor; uygulama iOS ve Android için tek kodla yazılır.
- Uygulama hiçbir para hareketine aracılık etmez. Bağış doğrudan STK'nın resmi hesabına yapılır, uygulama sadece kaydı tutar.
- Pilot grup haftalık buluşan 10-15 kişilik tek bir topluluktur; gruba sonradan üye eklenebilir. Apple Developer hesabı kararı mağaza aşamasına kadar bekler.

## 1. Ürün Gereksinim Belgesi

Ürün, mutat buluşmalara devamsızlığı cezalandırmak yerine gruba katkıya çevirir: gelmeyen gruba ikram ısmarlar ya da projeye bağış yapar. Para cezası tutan Avrupa ceza kasası uygulamalarından (Teamfy, TeamCollect) farkı, borcun aynî ödenip fotoğraf veya dekontla kapanmasıdır.

**Problem:** Gönüllülük ve sohbet gibi düzenli buluşmalarda katılım zamanla düşüyor. Para cezası ise gönüllülük motivasyonunu bozma riski taşıyor.

**Hedef kullanıcılar**

| Rol | Kim | Ne yapar |
| --- | --- | --- |
| Grup yöneticisi | Buluşmayı düzenleyen kişi | Grup ve buluşma oluşturur, buluşma konumunu, kuralları ve ikram listesini belirler |
| Üye | Buluşmaya katılan kişi | Yoklama verir, mazeret bildirir, borcunu kapatır |
| STK sorumlusu | STK'da bağışları takip eden kişi | Bağış dekontlarını onaylar, proje listesini günceller |

**MVP özellikleri (öncelik sırasıyla)**

1. Grup kurma ve davet linkiyle üye ekleme (WhatsApp üzerinden paylaşılabilir).
2. Tekrarlayan buluşma takvimi (ör. her perşembe 20:00).
3. Konumla yoklama: buluşma saat aralığında belirlenen konumda "Geldim"e basan üyenin konumu doğrulanır ve gelmiş sayılır. Doğrulanamayan üye buluşma bitince otomatik borçlu olur. QR yedek yöntem olarak kalır.
4. Mazeret akışı: grup bildirme süresini seçer (1 gün ya da 3 saat önce). Süresinde bildiren otomatik muaf, geç bildirilen mazereti grup oylar. Ani bir gelişmede üye "Acil durum" işareti çakar; bu mazeret oylamaya değil doğrudan yöneticinin onayına düşer. Mazeret için belge veya rapor istenmez.
5. Borç türü: ikram borcu ya da STK projesine bağış borcu. Grup ikram listesini belirler (tatlı, çiğköfte, yemek vb.), borçlu bu listeden seçer.
6. Borç kapama: uygulama içi kamerayla ikram fotoğrafı ve yöneticinin seçtiği onay, ya da dekont yükleme ve STK sorumlusu onayı.
7. Kademeli kural: ilk devamsızlık ikram, ikincisi bağış, üçüncüsünde yöneticiye bildirim. Kapanan borç devamsızlık sicilini silmez. İki buluşma içinde kapanmayan borç bir üst kademeye geçer ve miktarı bir kez ikiye katlanır (iki ikram ya da iki kat bağış); daha fazla katlanmaz.
8. Grup akışı: kapanan borçlar paylaşım olarak düşer, üyeler beğenebilir. Ay ve yıl sonunda üyelerin devam skorları liste olarak görülür.

**Sonra eklenecekler**

- Rozetler (ör. ardışık katılım serisi).
- "Bu ay devamsızlıklardan projelere şu kadar destek çıktı" sayacı.

**Kapsam dışı**

- Uygulama içinden para toplama veya ödeme alma.
- Sağlık raporu veya mazeret belgesi yükleme.
- Genel sosyal ağ özellikleri (takipçi, keşfet).

**Başarı ölçütleri**

- Pilot gruptaki katılım oranı %90'a çıkmalı. Karşılaştırma için pilottan önceki son 4 buluşmanın katılım oranı başlangıç değeri olarak kaydedilir.
- Açılan borçların en az %70'i iki buluşma içinde kapanmalı.

**Kurallar ve uç durumlar**

- Yönetici buluşmayı iptal eder ya da ertelerse o buluşma için kimseye borç düşmez.
- Uygulama 18 yaş ve üstü kullanıcılar içindir. İlk girişte yaş beyanı alınır; 18 yaş altı kayıt olamaz.
- Borcu açıkken gruptan ayrılan üyenin borcunu yönetici siler ya da kayıtlı tutar; seçim yöneticidedir.
- İkram fotoğrafının onay şeklini yönetici seçer: kendisi onaylar, onaycı olarak bir üye atar ya da onay şartını kaldırır (fotoğraf yüklenince borç kapanır). Varsayılan yönetici onayıdır.
- Mazeret oylaması eşit biterse kararı yönetici verir. Grup iki mazeretsiz devamsızlık eşiği belirler: arka arkaya (ör. 3) ve toplam (ör. 5). Hangisi önce dolarsa o geçerlidir. Eşiğe bir devamsızlık kala üye ve yönetici uyarılır; eşiğe ulaşınca yönetici onaylarsa üye gruptan çıkarılır, açık borcu için ayrılan borçlu kuralı geçerlidir.
- Yönetici gruptan ayrılmadan önce yöneticiliği bir üyeye devretmek zorundadır. Devretmeden hesabını silerse yöneticilik gruptaki en eski üyeye geçer.
- Üye hatırlatma bildirimlerini azaltabilir ya da kapatabilir. Yoklama ("Geldim") bildirimi bu ayardan etkilenmez.
- Yönetici, tek bir buluşma için gruptan bir üyeyi "Bu haftanın sorumlusu" atayabilir (buluşma detayından). Sorumlu sadece o buluşmada: yedek QR'ı gösterebilir, o haftanın buluşma yerini/saatini "sadece bu hafta" değiştirebilir, katılım listesini görür. Grup kurallarını değiştiremez, üye çıkaramaz, yöneticiliği devralamaz, kimsenin yoklamasını elle değiştiremez. Buluşma kapanınca sorumluluk kendiliğinden düşer (bir sonraki haftanın sorumlusu yoktur, yeniden atanması gerekir).

## 2. Teknik Gereksinim Belgesi

Uygulama Expo (React Native) ile tek kodla iOS ve Android için yazılır, arka uç olarak Supabase'in ücretsiz planı kullanılır. Bu yığın Mac gerektirmez, sunucu yönetimi istemez ve kart bilgisi gerektirmez.

| Katman | Araç | Kullanım |
| --- | --- | --- |
| Mobil uygulama | Expo (React Native, TypeScript) | Tüm ekranlar, kamera, konum doğrulama (expo-location), yedek QR okuma |
| Kimlik doğrulama | Supabase Auth | Pilotta e-posta ve şifreyle giriş; mağaza aşamasında Apple ile giriş (ve istenirse telefonla giriş) eklenir |
| Veritabanı | Supabase (PostgreSQL) | Gruplar, buluşmalar, yoklama, borçlar; satır düzeyi güvenlik (RLS) ile korunur |
| Dosya depolama | Supabase Storage (ücretsiz planda 1 GB) | İkram fotoğrafları, dekont görüntüleri |
| Bildirimler | Telefonun kendi takvimi (expo-calendar/legacy) + uygulama içi bildirim listesi | expo-notifications Android'de Expo Go'da çalışmadığı için buluşma hatırlatmaları "Takvimime ekle" butonuyla telefonun takvimine tekrarlayan etkinlik olarak ekleniyor (1 gün ve 2 saat önce alarm, takvimin kendi alarmı); borç ve onay istekleri uygulama içi listede. Mağaza aşamasında gerçek anlık bildirimler yeniden değerlendirilir |
| Zamanlanmış işler | Supabase veritabanı zamanlayıcısı (pg_cron) | Buluşma bitince yoklamayı kapatma, borç oluşturma, iki buluşmada kapanmayan borcu katlama |
| Derleme ve dağıtım | EAS Build + TestFlight | Şimdilik sadece Expo Go ile test; mağaza aşamasında iOS için TestFlight, Android için kurulum linki |

**Zorunlu teknik kurallar**

- Borç kapama fotoğrafı sadece uygulama içi kamerayla çekilir, galeriden seçim kapalıdır.
- Fotoğraf ve dekont yüklenmeden önce sıkıştırılır (en fazla 1 MB).
- Profil: ad ve soyad kayıtta zorunlu, profil fotoğrafı isteğe bağlıdır. Profil fotoğrafı kamerayla çekilebilir ya da galeriden seçilebilir (galeri yasağı sadece borç kapama fotoğrafları içindir); kare kırpılır ve en fazla 200 KB'a sıkıştırılır. Fotoğrafı olmayan kişi için adının baş harfleri mercan daire içinde gösterilir. Ad, soyad ve fotoğraf sadece aynı gruptaki üyelere görünür.
- Konum sadece uygulama açıkken ve "Geldim"e basıldığı anda alınır ("uygulamayı kullanırken" izni); arka planda sürekli takip yapılmaz. Buluşma noktası çevresinde 100 m yarıçap kabul edilir. Android'de sahte konum tespit edilirse yoklama reddedilir. Konum izni vermeyen ya da kapalı mekânda GPS'i zayıf kalan üye için yöneticinin gösterdiği QR yedektir.
- Pilotta giriş sadece e-posta ve şifreyle yapılır; telefonla (SMS) ve Apple ile giriş Expo Go'da sorunlu olduğu için mağaza aşamasına bırakılır. Mağazada başka bir sosyal giriş sunulursa Apple ile giriş de zorunlu olur.

**Harita**

- Yönetici buluşma yerini uygulama içindeki haritada iğne bırakarak ya da adres arayarak seçer; iğnenin çevresinde 100 m'lik yoklama alanı daire olarak görünür.
- Üye, buluşma detayında yeri küçük bir haritada görür ve "Yol tarifi al" butonuyla telefonundaki Apple Haritalar ya da Google Haritalar uygulamasına geçer.
- Harita, OpenStreetMap kaplamaları ve Leaflet ile (uygulama içi WebView üzerinde) gösterilir; react-native-maps (Google Haritalar) Android'de ücretsiz planda bile kredi kartlı bir API anahtarı istediği için kullanılmaz. Adres arama ücretsiz OpenStreetMap (Nominatim) ile yapılır; kart veya ücretli anahtar isteyen bir harita servisi kullanılmaz.

**Ücretsiz plan sınırları**

- Ücretsiz projeler bir hafta hareketsiz kalırsa duraklatılır. Bunu önlemek için birkaç günde bir projeye istek atan ücretsiz bir zamanlayıcı (ör. GitHub Actions) kurulur.
- 1 GB depolama sınırı için fotoğraflar 1 MB'ın altına sıkıştırılır, dekont görüntüleri onaydan 30 gün sonra silinir.
- Ücretli plana geçilmez; bir özellik ücretli plan gerektirirse alternatif aranır.

**KVKK ve mağaza kuralları**

- Dekonttan sadece tutar, tarih ve onay durumu kaydedilir. Görüntü onaydan sonra 30 gün içinde silinir.
- Mazeret için sağlık bilgisi veya belge istenmez; sadece serbest metin kısa açıklama alınır.
- Uygulama içinde para akışı olmadığı App Store inceleme notunda açıkça belirtilir. Uygulama içinden hesap silme mağaza yayını öncesi zorunludur; Expo Go aşamasında ertelenebilir.
- Aydınlatma metni ve açık rıza ekranı ilk girişte gösterilir. Yoklamada koordinat saklanmaz, sadece konumda olup olmadığı kaydedilir.

## 3. Kullanıcı Yolculuğu

Üç rol için ayrı akış vardır. Akışların kesiştiği nokta borçtur: yoklama borcu doğurur, üye kapatır, diğer üyeler ya da STK sorumlusu onaylar.

**Grup yöneticisi**

1. Uygulamayı indirir, e-posta ve şifreyle kayıt olur; adını ve soyadını yazar, isterse profil fotoğrafı ekler.
2. Grup oluşturur: ad, buluşma günü ve saati, haritadan seçilen buluşma konumu, mazeret bildirme süresi (1 gün ya da 3 saat önce).
3. Ceza kurallarını seçer: ikram, bağış ya da kademeli. İkram listesini belirler (tatlı, çiğköfte, yemek vb.). Bağış seçilirse STK sorumlusunu atar.
4. Davet linkini WhatsApp grubuna gönderir.
5. Buluşma yeri değişirse haritada yeni yeri işaretler; uygulama "Sürekli mi, sadece bu hafta mı?" diye sorar, değişiklik uygulama içi bildirim listesine düşer ve uygulama "WhatsApp grubuna da gönder" butonuyla hazır bir mesaj önerir (ör. "Bu perşembe buluşma [yer adı] adresinde, saat 20:00. Konum: [harita linki]"). Saat değişikliğinde de aynı buton çıkar. Konumu doğrulanamayan üye olursa yedek QR'ı açar.
6. İsterse bir buluşma için bir üyeyi "Bu haftanın sorumlusu" atar; o kişi sadece o buluşmada yedek QR gösterebilir ve yeri/saati "sadece bu hafta" değiştirebilir.
7. Devamsızlık eşiğine yaklaşan üye için uyarı alır; eşiğe ulaşan üyeyi gruptan çıkarmayı onaylar ya da bir şans daha verir.

**Üye**

1. Davet linkine tıklar, uygulamayı indirir, adını, soyadını ve isterse fotoğrafını ekleyerek kayıt olur, gruba katılır.
2. Buluşmadan bir gün önce ve iki saat önce hatırlatma alır.
3. Gelemeyecekse "Mazeret bildir" der:
    1. Süre içindeyse otomatik muaf olur.
    2. Süre geçmişse mazeret gruba oylamaya düşer; çoğunluk kabul ederse muaf olur. Ani bir gelişme varsa "Acil durum" işareti çakar; mazeret doğrudan yöneticinin onayına gider.
4. Buluşma başlarken bildirim alır, "Geldim"e basar; konumu doğrulanınca katılımı işlenir.
5. Gelmediyse buluşma bitiminde borç bildirimi alır.
6. Borcu kapatır:
    1. İkram borcu: listeden ikramı seçer, bir sonraki buluşmada uygulama içinden fotoğraflar, yöneticinin seçtiği onay tamamlanınca borç kapanır.
    2. Bağış borcu: projeyi seçer, bağışı STK hesabına yapar, dekontu yükler, STK sorumlusu onaylayınca borç kapanır.
7. Kapanan borç grup akışına düşer.

**STK sorumlusu**

1. Yönetici tarafından atanır, bildirimle haberdar olur.
2. Yurt içi ve yurt dışı proje listesini ekler: proje adı, kısa açıklama, IBAN.
3. Gelen dekontları görür, tutarı ve tarihi kontrol eder, onaylar ya da reddeder.
4. Aylık toplam bağış tutarını görür.

## 4. Tasarım Özeti

Ton cezalandırıcı değil, şakacı ve sıcak olmalı: "cezan var" yerine "ikram sırası sende" denir. Kırmızı uyarı renkleri kullanılmaz. Slogan "Geliyo musun?" mağaza sayfasında, açılış ekranında ve buluşma hatırlatma bildiriminde kullanılır; uygulama adı her yerde Gelgel olarak kalır.

**Görsel dil**

- Nihai palet: Mercan #EF5B45 (ana renk, ikon zemini, büyük yüzeyler; küçük yazıda kullanılmaz), Koyu mercan #C2381F (butonlar ve bağlantılar), Çini #0C4242 (başlıklar, koyu yüzeyler, "Geldim" onayı), Limon #F7C948 (rozet ve kutlama vurgusu, üzerinde koyu metin), Krem #FFF8F2 (ana zemin), Açık mercan #FFEDE6 (ikram ve borç kartları). Metin #2A2321, ikincil metin #6B5E59, çizgi #EADFD9. Yeşil kullanılmaz (WhatsApp ile karışır), kırmızı uyarı rengi yoktur. Koyu tema desteklenir.
- Yuvarlak köşeli kartlar, büyük dokunma alanları, kalın başlık yazı tipi.
- Borç ikonları: ikram borcu için tepsi, bağış borcu için el ve kalp.

**Arayüz referansı**

Ekranlar, docs/tasarim/referans-arayuz.jpeg görselindeki uygulamanın düzeninden ilhamla tasarlanır; renkler ise marka kılavuzundaki Gelgel paletine çevrilir. Referanstan alınacaklar:

- Ferah, açık zemin ve geniş boşluklar; ekran başına tek ana iş.
- Üstte ortalanmış büyük başlık ve altında kısa açıklama.
- Ekranın üst ortasında, çevresinde yumuşak açık halkalar olan yuvarlak bir simge alanı. Referanstaki cam küre yerine Gelgel logosu kullanılır.
- Tam genişlikte, yuvarlak (hap biçimli) büyük ana buton; sağında daire içinde ok.
- Beyaz, köşeleri yuvarlak, yumuşak gölgeli kartlar; üçlü kısayol kartları (ikon + kısa etiket).
- Seçenek listelerinde her satır ayrı bir beyaz kart: solda küçük renkli ikon, ortada metin, sağda yardımcı simge.
- Altta ekrandan ayrık duran, yuvarlak köşeli yüzen menü; seçili sekme dolu renkle gösterilir.
- Üstte geri ve kapat için daire içinde ikon butonlar.

Renk çevirisi: referanstaki yeşil ana buton ve seçili sekme → Koyu mercan #C2381F; yeşil vurgu alanları → Mercan #EF5B45 veya Açık mercan #FFEDE6; açık nane zemin → Krem #FFF8F2; pastel ikon renkleri → Çini, Limon ve Mercan tonları. Yeşil hiçbir yerde kullanılmaz.

**Metin örnekleri**

| Durum | Kullanılacak metin |
| --- | --- |
| Buluşma hatırlatması | Perşembe 20:00 — Geliyo musun? |
| Borç oluştu | Bu hafta seni özledik. İkram sırası sende. |
| Borç kapandı | Ahmet çiğköfteyi getirdi, borç kapandı. |
| Mazeret kabul | Mazeretin kabul edildi, geçmiş olsun. |
| Üçüncü devamsızlık (yöneticiye) | Ayşe son üç buluşmaya katılmadı, bir arayalım mı? |

**Ekran listesi**

1. Giriş ve açık rıza.
2. Gruplarım.
3. Grup ana sayfası: sıradaki buluşma, grup akışı, açık borçlar, aylık ve yıllık devam skoru listesi.
4. Buluşma detayı: katılım listesi, "Geldim" butonu (üye), yedek QR (yönetici ya da o haftanın sorumlusu), "Bu haftanın sorumlusu" atama (yönetici).
5. Mazeret bildir.
6. Borcum: tür, kapatma adımları, kamera veya dekont yükleme.
7. Onay bekleyenler (üye onayı ve STK onayı).
8. Grup ayarları: kurallar, buluşma konumu, ikram listesi, üyeler, STK projeleri.
9. Profil: ad, soyad ve profil fotoğrafını değiştirme, bildirim ayarları, katılım serisi ve rozetler (rozetler sonraki sürüm).

## 5. Veritabanı ve Şema

Supabase'de (PostgreSQL) yedi tablo yeterlidir. Kullanıcı kendi grubunun dışındaki hiçbir veriyi okuyamaz; bu, satır düzeyi güvenlik (RLS) kurallarıyla sağlanır.

| Tablo | Temel alanlar | Not |
| --- | --- | --- |
| profiles | id (Supabase Auth kullanıcısı), ad, soyad, e-posta, profilFotoğrafıUrl (isteğe bağlı), yaşBeyanı (18+), bildirimTercihi, oluşturulma tarihi | E-posta sadece kullanıcının kendisine görünür |
| groups | ad, yöneticiId, buluşmaKuralı (gün, saat, süre), mazeretSüresi (24 / 3 saat), ikramOnayŞekli (yönetici / atanan üye / onaysız), onaycıId, konum (enlem, boylam, yarıçapMetre), ikramListesi, ardışıkDevamsızlıkEşiği, toplamDevamsızlıkEşiği, cezaKuralı (ikram / bağış / kademeli), stkSorumlusuId | Davet kodu da burada tutulur |
| group_members | groupId, userId, rol (yönetici / üye / STK sorumlusu), katılma tarihi | Grup üyeliği ve roller |
| meetings | groupId, başlangıç, bitiş, buHaftaKonum (varsa grup konumunun yerine geçer), yedekQrKodu (30 saniyede bir değişen gizli tohumdan türetilir, saklanmaz), durum (açık / kapandı), sorumluId (isteğe bağlı, "bu haftanın sorumlusu") | Zamanlayıcı (pg_cron) buluşma bitince durumu kapatır; yeni hafta yeni satır olduğu için sorumluId de o haftaya özeldir |
| attendance | meetingId, userId, durum (geldi / mazeretli / gelmedi), yöntem (konum / QR), mazeretMetni, acilDurum, mazeretOyları | Gelmedi kaydı borç oluşturur |
| debts | groupId, userId, meetingId, tür (ikram / bağış), ikramSeçimi, kademe, katsayı (1 / 2), açıkKaldığıBuluşmaSayısı, durum (açık / onay bekliyor / kapandı / reddedildi), kanıtUrl, bağışTutarı, projeId, onaylayanlar | Kapanınca grup akışına düşer |
| projects | groupId, ad, açıklama, kapsam (yurt içi / yurt dışı), iban, aktif | Sadece STK sorumlusu düzenler |

**Güvenlik kuralları**

- Grup verisini sadece group_members tablosunda o grubun üyesi olanlar okur.
- Buluşma ve proje ayarlarını sadece yönetici ve STK sorumlusu değiştirir.
- Borcu sadece borçlu kişi kanıtla günceller; durumu "kapandı"ya sadece onaylayanlar çevirir.
- Bir üye kendi borcunu onaylayamaz.
- Supabase Storage'daki dekont görüntüleri sadece borçlu ve STK sorumlusu tarafından görülebilir.

## 6. Uygulama Planı

Geliştirme altı faza bölünür ve her faz ayrı bir Claude Code sohbetinde yapılır. Her sohbete sadece o fazın ihtiyaç duyduğu bölümler verilir, bir faz test edilmeden sonrakine geçilmez.

| Faz | İçerik | Claude Code'a verilecek bölümler | Bitti sayılma ölçütü |
| --- | --- | --- | --- |
| 1. Kurulum | Expo projesi, Supabase bağlantısı, e-posta ve şifreyle kayıt/giriş/çıkış, açık rıza ve 18 yaş beyanı | 1, 2 | Telefonda giriş yapılıp çıkılabiliyor |
| 2. Grup | Grup oluşturma, davet linki, üye listesi | 1, 3, 5 | İkinci bir telefon davet linkiyle gruba katılıyor |
| 3. Buluşma ve yoklama | Tekrarlayan buluşma, konumla yoklama, yedek QR, hatırlatma bildirimi | 2, 3, 5 | Konumda "Geldim"e basan "geldi" olarak işleniyor, bildirim geliyor |
| 4. Mazeret ve borç | Mazeret bildirme ve oylama (eşitlikte yönetici), buluşma iptali, otomatik borç, vade ve katlama | 1, 3, 5 | Gelmeyene borç düşüyor, süresinde mazeret bildiren muaf |
| 5. Borç kapama | Kamera fotoğrafı, dekont yükleme, üye ve STK onayı, grup akışı | 2, 3, 4, 5 | İkram ve bağış borcu uçtan uca kapanıyor |
| 6. Pilot | Tasarım düzeltmeleri, yönetici devri, bildirim ayarları, Expo Go ile pilot grupta kullanım | 2, 4 | Pilot grup iki buluşma boyunca kullanıyor |

**Pilot sonrası karar noktası**

İki buluşma sonunda üç soruya bakılır: katılım %90'a çıktı mı, borçların en az %70'i iki buluşmada kapandı mı, grupta ceza tepkisi oldu mu. Sonuç olumluysa rozetler ve bağış sayacı eklenir, sonra hesap silme eklenip EAS derlemesiyle App Store başvurusu yapılır.

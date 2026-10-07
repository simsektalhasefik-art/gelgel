# Gelgel – İlerleme notları

Her faz bitince Claude Code bu dosyaya şu başlıklarla ekleme yapar: yapılanlar, alınan kararlar, bilinen eksikler.

## Faz 1 – Kurulum (2026-10-07)

**Yapılanlar**
- Expo (React Native, TypeScript, SDK 57) projesi kuruldu, git başlatıldı.
- Supabase projesi açıldı: "Gelgel" organizasyonu, `gelgel` projesi, Frankfurt (eu-central-1) bölgesi, ücretsiz plan.
- `profiles` tablosu ve RLS kuralları migration olarak yazılıp uygulandı (`supabase/migrations/20261007000000_profiles_and_avatars.sql`).
- `avatars` Storage bucket'ı açıldı: özel (public değil), en fazla 200 KB, sadece JPEG/PNG/WebP; herkes (giriş yapmış) görebilir, herkes sadece kendi fotoğrafını yükleyip değiştirebilir.
- E-posta/şifre ile giriş açıldı, "Confirm email" (e-posta doğrulama) kapatıldı.
- Ekranlar: Giriş; Kayıt (ad, soyad, e-posta, şifre + şifre tekrar, şifre alanlarında göz ikonu, en az 8 karakter şartı, profil fotoğrafı isteğe bağlı kamera/galeri + kare kırpma + 200 KB'a sıkıştırma, aydınlatma metni + açık rıza + 18 yaş onay kutuları); Profil (ad/soyad/fotoğrafı değiştirme, aydınlatma metnini her zaman okuma, çıkış yap).
- Oturum `AsyncStorage` ile kalıcı; uygulama kapanıp açılınca giriş hatırlanıyor.
- Marka paleti ve Baloo 2 yazı tipi uygulandı, ekran düzeni referans arayüzden ilhamla tasarlandı.
- Aydınlatma metni taslağı yazıldı (`src/content/aydinlatmaMetni.ts`).
- Bağlantı bilgileri `.env` dosyasında (git'e girmiyor); migration/SQL yardımcı scriptleri `scripts/` klasöründe.

**Alınan kararlar**
- Supabase CLI'nin yönetim (Management API) token akışı bu ortamda tam çalışmadığından, migration ve SQL işlemleri `scripts/apply-migration.js` ve `scripts/run-sql.js` ile doğrudan Postgres bağlantısı üzerinden yapılıyor; `supabase link` kullanılmıyor. Sonraki fazlarda yeni migration dosyası eklenip aynı yöntemle uygulanabilir.
- Hesap erişim anahtarı (access token) projede saklanmıyor; tek seferlik kullanımdan sonra Supabase panelinden iptal edildi.
- Aydınlatma metni ve 18 yaş onayı, ayrı bir açılış ekranı yerine doğrudan kayıt ekranının içine kondu (ilk tasarımda onay sadece ilk açılışta gösteriliyordu ve bir daha çıkmadığından sonraki kayıtlarda onay bilgisine ulaşılamıyordu; bu kayıt ekranına taşınarak çözüldü).
- `avatars` bucket'ının okuma izni şimdilik "giriş yapmış herkes" ile sınırlı; grup tablosu Faz 2'de gelince "sadece aynı gruptaki üyeler" kuralına geçilecek.

**Bilinen eksikler**
- Aydınlatma metnindeki veri sorumlusu adı/iletişim bilgisi yer tutucu (`[VERİ SORUMLUSU ADI VE İLETİŞİM]`); gerçek bilgi netleşince `src/content/aydinlatmaMetni.ts` güncellenmeli.
- Gelgel adı için TÜRKPATENT, App Store ve alan adı kontrolü henüz yapılmadı (açık karar, bu adım Claude Code dışında).
- Koyu tema, rozetler gibi sonraki sürüm özellikleri bilinçli olarak eklenmedi (Faz 1 kapsamı dışı).

## Faz 2 – Grup (2026-10-07)

**Yapılanlar**
- `groups` ve `group_members` tabloları migration olarak eklendi (`supabase/migrations/20261007120000_groups_and_membership.sql`). Tüm okuma RLS ile korunuyor; ekleme/güncelleme/silme doğrudan değil, sadece güvenli (security definer) veritabanı fonksiyonlarıyla yapılıyor: `create_group`, `join_group`, `regenerate_invite_code`, `transfer_group_admin`, `leave_group`, `group_member_profiles`.
- Davet kodu: 8 karakter, karışabilecek karakterler (0, O, 1, I, L) hariç, büyük harf. `join_group` yanlış kodda "Kod geçersiz.", aynı kişi ikinci kez katılmaya çalışırsa "Bu grubun üyesisin zaten." döndürüyor; `group_members` üzerinde de (grup, üye) için eşsizlik kuralı var (çift güvence).
- `group_member_profiles` fonksiyonu üye listesini (ad, soyad, fotoğraf, rol) e-posta olmadan döndürüyor; `profiles` tablosunun kendisi hâlâ sadece kişinin kendisine açık, e-posta hiçbir zaman grup arkadaşlarına görünmüyor.
- `avatars` deposunun okuma izni Faz 1'deki karara göre güncellendi: artık "giriş yapmış herkes" değil, sadece kendisi ve aynı gruptaki üyeler görebiliyor (`shares_group_with` fonksiyonu).
- `group_members.rol` üç değer alıyor: yönetici, üye, stk_sorumlusu. STK sorumlusu ekranları Faz 5'te gelecek, şimdilik sadece veritabanında tanımlı.
- React Navigation devreye alındı (zaten kurulu paketlerle): Gruplarım, Grup oluştur, Gruba katıl, Grup ana sayfası, Grup ayarları, Profil ekranları arasında geçiş; Gruplarım ve Profil'de altta yüzen, seçili sekmesi dolu renkle gösterilen basit bir menü var.
- Ekranlar: Gruplarım (grup listesi + oluştur/katıl), Grup oluştur (sadece ad), Gruba katıl (davet kodu), Grup ana sayfası (davet kodu kartı + "WhatsApp'a gönder" + üye listesi + ayarlara dişli ikonuyla geçiş), Grup ayarları (üye listesi, yöneticiliği devret, davet kodunu yenile, gruptan ayrıl).
- Davet linki: `expo-linking` ile `exp://.../--/katil/KOD` biçiminde gerçek bir bağlantı üretiliyor ve "WhatsApp'a gönder" paylaşım sayfasını açıyor; link her zaman düz kodla birlikte gönderiliyor (link açılmazsa kişi kodu elle yazabilsin diye). Link, oturum açıkken tıklanırsa doğrudan "Gruba katıl" ekranını kodla dolu açıyor; oturum kapalıyken tıklanırsa kod geçici olarak tutulup giriş/kayıt sonrası aynı ekrana yönlendiriyor.
- Ekranlar impeccable skill'iyle bir kez gözden geçirildi: ayarlar ekranındaki dişli ikonu emoji yerine çizilmiş SVG ikonla değiştirildi (emoji ikon seti olarak kullanılmaz kuralı), meşgul (işlem sürerken) durumlarda düğmelere görünür soluklaşma eklendi, uzun üye listelerinin düzgün kaymasını sağlayacak stil eksikleri giderildi, tekrarlayan "ikincil buton" görünümü `SecondaryButton` bileşeninde birleştirildi.
- Telefonda test sonrası düzeltmeler: alttaki yüzen menü artık `useSafeAreaInsets` ile Android'in sistem çubuğunun üstünde, aralıklı duruyor (önceden sistem düğmelerinin altına giriyordu). Sistemin `Alert.alert` pencereleri tamamen kaldırıldı; yerine marka temasıyla uyumlu kendi bileşenlerimiz geldi: `src/ui/dialog.tsx` (`showAppAlert` — beyaz kart, çini başlık, koyu mercan ana buton, açık mercan ikincil buton) ve `src/ui/toast.tsx` (`showToast` — kısa, kendiliğinden kapanan bilgi şeridi). Yeni bir "Ayarlar" ekranı eklendi (aydınlatma metni, çıkış yap); bunlar Profil ekranından ayarlara taşındı, Profil ekranında sadece fotoğraf/ad-soyad/e-posta/"Bilgileri düzenle" kaldı. Profil ve Grup ana sayfası ekranlarındaki dişli ikonları artık aynı görünüyor: marka renginde, başlıkla aynı hizada.

**Alınan kararlar**
- `groups` tablosu davet koduyla doğrudan aranabilir şekilde açılmadı; kullanıcı istediği gibi bütün değişiklikler (grup oluşturma, katılma, kod yenileme, yöneticilik devri, ayrılma) sadece security definer fonksiyonlarla yapılıyor, tablolarda istemci tarafından doğrudan ekleme/güncelleme/silme yok.
- Grup oluşturan kişi otomatik olarak "yönetici" rolüyle `group_members`'a ekleniyor; `groups` tablosunda ayrı bir `yöneticiId` sütunu tutulmuyor, tek doğruluk kaynağı `group_members.rol`.
- Buluşma günü/saati, konum, ikram listesi, mazeret süresi gibi `groups` şemasındaki diğer alanlar bu fazda eklenmedi; Faz 3 ve Faz 4'te ilgili migration'larla gelecek.
- Davet linki şu an Expo Go'nun geliştirme bağlantısı biçiminde (`exp://`); bu, aynı Wi-Fi ağındaki/geliştirme sunucusuna bağlı telefonlar arasında güvenilir çalışır. Gerçek pilotta (Faz 6, farklı ağlardaki telefonlar) bu linkin güvenilirliği yeniden değerlendirilmeli; düz davet kodu her durumda yedek olarak kalıyor.
- CLAUDE.md'ye kalıcı kural eklendi: sistem Alert.alert pencereleri kullanılmaz, tüm uyarı/onay/bilgi mesajları temaya uygun kendi bileşenimizle gösterilir; tüm ekranlar güvenli alanı hesaba katar. Bu kural geriye dönük olarak Faz 1 ekranlarındaki (Giriş, Kayıt, Profil) Alert.alert çağrılarına da uygulandı.

**Bilinen eksikler**
- Davet linkinin Expo Go geliştirme biçimi, farklı Wi-Fi ağlarındaki iki telefon arasında güvenilir çalışmayabilir; test ederken iki telefonun da aynı ağda ve aynı geliştirme sunucusuna bağlı olması gerekiyor. Gerçek pilot öncesi (Faz 6) yeniden bakılacak.
- Gruptan ayrılan üyenin açık borcu ne olacağı kuralı (yöneticinin silmesi ya da kayıtlı tutması) henüz yok; borç kavramı Faz 4'te geldiğinde eklenecek.
- Hesabını silen yöneticinin yöneticiliğinin en eski üyeye otomatik geçmesi kuralı henüz yok; hesap silme zaten mağaza aşamasına kadar kapsam dışı (CLAUDE.md).
- Faz 1'den kalan aydınlatma metni yer tutucusu ve Gelgel adı kontrolü hâlâ açık.

## Faz 3 – Buluşma ve yoklama (2026-10-07)

**Yapılanlar**
- `groups` tablosuna buluşma günü/saati/süresi ve konum (enlem, boylam, 100 m yarıçap, adres) eklendi; yeni `meetings` ve `attendance` tabloları (`supabase/migrations/20261007130000...` ve devamı). pg_cron (15 dakikada bir) hem sıradaki buluşmayı otomatik oluşturuyor hem süresi geçeni kapatıp gelmeyenleri "gelmedi" işaretliyor (borç oluşturmuyor, bu Faz 4'te gelecek). Saat hesapları Europe/Istanbul'a göre; pg_cron UTC çalıştığı için bu özellikle veritabanında doğrudan test edilerek doğrulandı.
- Buluşma ayarları ekranı: gün/saat/süre seçimi, haritadan yer seçme, "Şu an buradayım, burayı seç" (birincil) ve adres arama (Nominatim, ikincil, sadece "Ara"ya basınca). Var olan bir kural değiştirilirken "Sürekli mi, sadece bu hafta mı?" sorulur.
- Grup ana sayfasında "Sıradaki buluşma" kartı; buluşma detayında küçük harita, "Yol tarifi al", katılım listesi, "Geldim" butonu (buluşma başlamadan 30 dk önce açılır, bitince kapanır).
- "Geldim": konum tamamen sunucuda doğrulanıyor — telefon ham enlem/boylamı güvenli bir veritabanı fonksiyonuna gönderiyor, fonksiyon mesafeyi hesaplayıp sadece sonucu (geldi/gelmedi, yöntem) yazıyor; koordinat hiçbir tabloya yazılmıyor (KVKK). Android'de sahte konum reddediliyor.
- Yedek QR: kod hiçbir yerde sabit tutulmuyor, her buluşmaya özel gizli bir tohumdan ve 30 saniyelik zaman diliminden anlık hesaplanıyor; yönetici (ya da o haftanın sorumlusu) "Yedek QR göster" ile gösterir, üye "QR ile yoklama ver" ile kamerayla okutur.
- "Bu haftanın sorumlusu": yönetici buluşma detayından bir üyeyi atayabiliyor; sorumlu sadece o buluşma için yedek QR'ı gösterebiliyor ve yeri/saati "sadece bu hafta" değiştirebiliyor, grup kurallarına/üyelere/yöneticiliğe dokunamıyor. Yetki kontrolleri tamamen veritabanı fonksiyonlarında; buluşma kapanınca (yeni hafta yeni satır olduğundan) sorumluluk kendiliğinden düşüyor.
- Hatırlatma: "Takvimime ekle" butonu (grup ana sayfası + buluşma detayı) telefonun kendi takvimine haftalık tekrarlayan bir etkinlik ekliyor (1 gün ve 2 saat önce alarm, notunda adres + harita linki); eklenen etkinliğin kimliği telefonda saklanıp uygulama her açıldığında buluşma değiştiyse sessizce güncelleniyor.
- "WhatsApp grubuna da gönder" butonu, buluşma yeri/saati değişince hazır bir mesaj paylaşıma açıyor.
- Ücretsiz Supabase projesini uyanık tutan günlük bir GitHub Actions dosyası hazırlandı (`.github/workflows/supabase-keepalive.yml`); henüz bir GitHub deposuna bağlanmadı (bkz. bilinen eksikler).
- Telefonda test sonrası birkaç düzeltme yapıldı: `SecondaryButton` metni alt satıra kayınca ortalanmıyordu (artık ortalı), Buluşma detayı ekranında kenar boşluğu bir ara iki kez uygulanıyordu (düzeltildi), Buluşma detayı'ndaki üç buton yan yana sıkışmak yerine alt alta tam genişlikte gösteriliyor.

**Alınan kararlar**
- **Harita:** react-native-maps (Google Haritalar) Android'de ücretsiz planda bile kredi kartlı bir API anahtarı istediği için (proje kuralına aykırı) tamamen kaldırıldı; yerine ücretsiz OpenStreetMap + Leaflet (uygulama içi WebView) kullanıldı, iOS ve Android'de aynı görünüyor, anahtar gerekmiyor. Yer seçimi de "dokunup iğne bırakma" yerine "haritayı sürükle, iğne ortada sabit dursun" modeline çevrildi (WebView içinde dokunma/sürükleme ayrımı güvenilir değildi, iğne zor taşınıyordu).
- **Bildirimler:** expo-notifications, Android'de Expo Go'da (SDK 53+) paket içe aktarılır aktarılmaz çöktüğü için (push token kaydı zorunlu ve kapatılamıyor) tamamen kaldırıldı. Yerine telefonun kendi takvimi kullanıldı; `expo-calendar`'ın YENİ API'si de Expo Go'da çalışmadığından, paketin uzun süredir Expo Go'da sorunsuz çalışan eski ("legacy") API'si (`expo-calendar/legacy`) tercih edildi. Gerçek anlık bildirimler mağaza aşamasında (gerçek derleme) yeniden değerlendirilecek.
- Yedek QR kodunu üreten gizli tohum (`qr_sir`) sütunu, güvenli fonksiyonlar dışında (üye dahil) hiçbir istemciye açılmıyor; bunu sütun bazlı veritabanı izniyle sağlarken ilk denemede (sütun bazlı `revoke`) yetersiz kaldığı görüldü — Supabase'in geniş tablo düzeyi izni öncelik aldığından önce tablo düzeyi SELECT tamamen kaldırılıp sadece güvenli sütunlara izin verilerek düzeltildi.
- CLAUDE.md'ye not düşüldü: bildirimler artık takvim üzerinden, mağaza aşamasında gerçek bildirimler yeniden değerlendirilecek.

**Bilinen eksikler**
- Uyanık tutma zamanlayıcısı dosyası hazır ama bir GitHub deposuna bağlanmadı; kullanıcının onayıyla (gizli/private depo) en kısa sürede bağlanmalı, yoksa ücretsiz Supabase projesi bir hafta hareketsiz kalırsa duraklayabilir.
- Gerçek anlık bildirimler (push) Expo Go'da mümkün değil; mağaza aşamasında yeniden değerlendirilecek, şimdilik takvim hatırlatması yeterli kabul edildi.
- Davet linkinin farklı Wi-Fi'lerde güvenilirliği hâlâ Faz 6'da yeniden değerlendirilecek (Faz 2'den kalan not).
- Gruptan ayrılan üyenin açık borcu kuralı henüz yok (Faz 4'te borç kavramıyla birlikte gelecek).
- Faz 1'den kalan aydınlatma metni yer tutucusu ve Gelgel adı kontrolü hâlâ açık.

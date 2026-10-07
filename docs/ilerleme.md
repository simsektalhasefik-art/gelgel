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

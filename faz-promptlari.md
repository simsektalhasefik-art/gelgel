# Gelgel – Faz faz Claude Code komutları

## Yol haritası (bu sırayla ilerle)

| Sıra | Ne | Nerede |
| --- | --- | --- |
| 1 | Faz 1 – Kurulum | Claude Code |
| 2 | (İsteğe bağlı) Ekran taslakları ve 3-5 kişiyle test; logo ve referans zaten docs/tasarim'da | claude.ai sohbeti |
| 3 | Gelgel ad kontrolü (TÜRKPATENT) | İnternet |
| 4 | Hazırlanan ekran taslakları varsa docs/tasarim klasörüne koy | Bilgisayarın |
| 5 | Faz 2 – Grup | Claude Code |
| 6 | Faz 3 – Buluşma ve yoklama | Claude Code |
| 7 | Faz 4 – Mazeret ve borç | Claude Code |
| 8 | Faz 5 – Borç kapama | Claude Code |
| 9 | Faz 6 – Pilot hazırlığı (logo uygulama ikonu ve açılış ekranı olur) | Claude Code |
| 10 | Pilot: grupla iki buluşma | Pilot grup |

## Kısayol: komutları elle yapıştırmana gerek yok

Claude Code'da şunları yazman yeterli:

- `/sonraki-faz` → Claude Code devir notuna bakar, sıradaki fazı bulur ve o fazın komutunu kendisi uygular.
- `/faz-bitir` → Telefonda test ettiğini sorar, devir notunu yazar, kayıt noktası oluşturur.
- `/clear` → Sohbeti temizler; yeni pencere açmadan aynı yerde devam edersin.

Döngü: `/sonraki-faz` → planı onayla → telefonda test et, hataları aynı sohbette düzelttir → `/faz-bitir` → `/clear` → `/sonraki-faz`

Aşağıdaki komutlar, kısayol çalışmazsa elle yapıştırmak için yedek olarak duruyor.
Bir faz telefonda test edilip "bitti" ölçütü sağlanmadan sonrakine geçme.
Test sırasında çıkan hataları aynı sohbette düzelttir; düzeltme için yeni sohbet açma.

**Her fazın sonunda (bitti ölçütü sağlanınca) aynı sohbete şunu yaz:**

> Bu fazda yapılanları, alınan kararları ve bilinen eksikleri docs/ilerleme.md dosyasına ekle. Sonra bu hâli bir kayıt noktası olarak kaydet (git commit).

## Faz 1 – Kurulum
docs/gelgel-belgeleri.md dosyasının 1. ve 2. bölümlerini oku. Giriş ve kayıt ekranlarını docs/tasarim/referans-arayuz.jpeg görselindeki düzenden ilhamla ve docs/tasarim/marka-kilavuzu.md renkleriyle tasarla; ekranın üst ortasında docs/tasarim/logo-yuvarlak.png logosunu kullan. Sadece Uygulama Planı'ndaki Faz 1'i yap: Expo projesini kur, Supabase'i bağla, e-posta ve şifreyle kayıt, giriş ve çıkış ekranlarını, kayıtta ad ve soyad (zorunlu) ile profil fotoğrafı (isteğe bağlı, kamera ya da galeri) alanlarını, bunları sonradan değiştirmek için basit bir profil ekranını, ilk açılıştaki aydınlatma metni, açık rıza ve 18 yaş beyanı ekranını yap. Telefonla (SMS) ve Apple ile giriş YAPMA; bunlar mağaza aşamasına kaldı. Uygulama sadece Expo Go ile çalışacak, Expo Go'da çalışmayan bir paket kullanma. Ekranlarda impeccable skill'ini kullan (CLAUDE.md, "Yüklü skill'ler"). Önce yapacaklarını madde madde yaz ve onayımı bekle. Supabase kurulumunu CLAUDE.md'deki "Supabase kurulumu" kurallarına göre kendin yap: benden sadece Supabase girişini onaylamamı iste; projeyi, .env dosyasını, ilk tabloları, güvenlik kurallarını ve E-posta/Şifre girişini sen ayarla. Sadece ücretsiz plan kullan. Projede git'i başlat (git init) ki her fazın sonunda kayıt noktası oluşturabilelim; Supabase bağlantı bilgilerinin git'e girmemesi için .gitignore ayarla. Fazın sonunda, bitti ölçütü sağlanınca, yapılanları, alınan kararları ve bilinen eksikleri docs/ilerleme.md dosyasına eklemeyi ve git commit ile kayıt noktası oluşturmayı unutma.

## Faz 2 – Grup
Önce docs/ilerleme.md dosyasını oku. Sonra docs/gelgel-belgeleri.md dosyasının 1., 3. ve 5. bölümlerini oku. Ekranları docs/tasarim/referans-arayuz.jpeg görselindeki düzenden ilhamla ve docs/tasarim/marka-kilavuzu.md renkleriyle tasarla (Bölüm 4, "Arayüz referansı"); docs/tasarim klasöründe bu ekranın kendi tasarımı varsa ona uy. Sadece Faz 2'yi yap: grup oluşturma, WhatsApp'tan paylaşılabilir davet linki, üye listesi, yönetici devri kuralı. Ekranlarda impeccable skill'ini kullan (CLAUDE.md, "Yüklü skill'ler"). Önce planını yaz ve onayımı bekle. Fazın sonunda, bitti ölçütü sağlanınca, yapılanları, alınan kararları ve bilinen eksikleri docs/ilerleme.md dosyasına eklemeyi ve git commit ile kayıt noktası oluşturmayı unutma.

## Faz 3 – Buluşma ve yoklama
Önce docs/ilerleme.md dosyasını oku. Sonra docs/gelgel-belgeleri.md dosyasının 2., 3. ve 5. bölümlerini oku. Ekranları docs/tasarim/referans-arayuz.jpeg görselindeki düzenden ilhamla ve docs/tasarim/marka-kilavuzu.md renkleriyle tasarla (Bölüm 4, "Arayüz referansı"); docs/tasarim klasöründe bu ekranın kendi tasarımı varsa ona uy. Sadece Faz 3'ü yap: tekrarlayan buluşma, haritadan buluşma yeri seçme (iğne bırakma, adres arama, 100 m yoklama dairesi; Bölüm 2 "Harita"), buluşma detayında küçük harita ve "Yol tarifi al" butonu, yer veya saat değişince "sürekli mi, bu hafta mı" sorusu, uygulama içi bildirim ve "WhatsApp grubuna da gönder" butonu, "Geldim" butonuyla konum doğrulama (100 m), yedek QR, telefonda zamanlanan yerel hatırlatma bildirimleri, ücretsiz Supabase projesinin duraklamaması için uyandırma zamanlayıcısı. Ekranlarda impeccable skill'ini kullan (CLAUDE.md, "Yüklü skill'ler"). Önce planını yaz ve onayımı bekle. Fazın sonunda, bitti ölçütü sağlanınca, yapılanları, alınan kararları ve bilinen eksikleri docs/ilerleme.md dosyasına eklemeyi ve git commit ile kayıt noktası oluşturmayı unutma.

## Faz 4 – Mazeret ve borç
Önce docs/ilerleme.md dosyasını oku. Sonra docs/gelgel-belgeleri.md dosyasının 1., 3. ve 5. bölümlerini oku. Ekranları docs/tasarim/referans-arayuz.jpeg görselindeki düzenden ilhamla ve docs/tasarim/marka-kilavuzu.md renkleriyle tasarla (Bölüm 4, "Arayüz referansı"); docs/tasarim klasöründe bu ekranın kendi tasarımı varsa ona uy. Sadece Faz 4'ü yap: mazeret bildirme (1 gün / 3 saat seçeneği), grup oylaması (eşitlikte yönetici), "Acil durum" işareti, buluşma iptali, buluşma bitince otomatik borç, iki buluşmada bir kez katlama, arka arkaya ve toplam devamsızlık eşikleri. Ekranlarda impeccable skill'ini kullan (CLAUDE.md, "Yüklü skill'ler"). Önce planını yaz ve onayımı bekle. Fazın sonunda, bitti ölçütü sağlanınca, yapılanları, alınan kararları ve bilinen eksikleri docs/ilerleme.md dosyasına eklemeyi ve git commit ile kayıt noktası oluşturmayı unutma.

## Faz 5 – Borç kapama
Önce docs/ilerleme.md dosyasını oku. Sonra docs/gelgel-belgeleri.md dosyasının 2., 3., 4. ve 5. bölümlerini oku. Ekranları docs/tasarim/referans-arayuz.jpeg görselindeki düzenden ilhamla ve docs/tasarim/marka-kilavuzu.md renkleriyle tasarla (Bölüm 4, "Arayüz referansı"); docs/tasarim klasöründe bu ekranın kendi tasarımı varsa ona uy. Sadece Faz 5'i yap: ikram listesinden seçim, uygulama içi kamerayla fotoğraf, yöneticinin seçtiği onay şekli, dekont yükleme ve STK onayı, grup akışı, aylık ve yıllık devam skoru listesi. Ekranlarda impeccable skill'ini kullan (CLAUDE.md, "Yüklü skill'ler"). Önce planını yaz ve onayımı bekle. Fazın sonunda, bitti ölçütü sağlanınca, yapılanları, alınan kararları ve bilinen eksikleri docs/ilerleme.md dosyasına eklemeyi ve git commit ile kayıt noktası oluşturmayı unutma.

## Faz 6 – Pilot hazırlığı
Önce docs/ilerleme.md dosyasını oku. Sonra docs/gelgel-belgeleri.md dosyasının 2. ve 4. bölümlerini oku. Sadece Faz 6'yı yap: docs/tasarim/logo.png dosyasını uygulama ikonu ve açılış ekranı olarak ekleme, tüm ekranların docs/tasarim/referans-arayuz.jpeg düzeni ve marka kılavuzu renkleriyle tutarlı olduğunu kontrol edip düzeltme, bildirim ayarları, uygulamanın pilot grupta Expo Go ile kullanılması için hazırlık. Ekranlarda impeccable skill'ini kullan (CLAUDE.md, "Yüklü skill'ler"). Önce planını yaz ve onayımı bekle. Fazın sonunda, bitti ölçütü sağlanınca, yapılanları, alınan kararları ve bilinen eksikleri docs/ilerleme.md dosyasına eklemeyi ve git commit ile kayıt noktası oluşturmayı unutma.

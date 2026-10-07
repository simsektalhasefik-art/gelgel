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

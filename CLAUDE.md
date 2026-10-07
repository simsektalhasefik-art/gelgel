# Gelgel – Claude Code çalışma kuralları

## Proje
Gelgel (slogan: "Geliyo musun?"), arkadaş grupları ve STK ekiplerinin haftalık buluşmalarına katılımı takip eden bir mobil uygulamadır.
Gelmeyene ikram ya da STK projesine bağış borcu düşer; borç fotoğraf veya dekontla kapanır.
Tüm gereksinimler `docs/gelgel-belgeleri.md` dosyasındadır. Bölüm numaraları:
1 Ürün Gereksinimleri · 2 Teknik Gereksinimler · 3 Kullanıcı Yolculuğu · 4 Tasarım Özeti · 5 Veritabanı ve Şema · 6 Uygulama Planı

## Teknoloji
- Expo (React Native, TypeScript). Şimdilik sadece Expo Go ile test edilir; EAS Build ve mağaza işleri yapılmaz.
- Supabase (ücretsiz plan): Auth, PostgreSQL veritabanı, Storage, veritabanı zamanlayıcısı (pg_cron). Firebase KULLANILMAZ.
- Giriş pilotta sadece e-posta ve şifreyle (Supabase Auth). Telefonla ve Apple ile giriş mağaza aşamasında eklenecek.
- Expo Go'da çalışmayan yerel paketler kullanılmaz; @supabase/supabase-js kullanılır.
- Bildirimler: buluşma hatırlatmaları expo-notifications ile telefonda zamanlanan yerel bildirimler; borç ve onay istekleri uygulama içi bildirim listesinde.
- Konum için expo-location, sadece "uygulamayı kullanırken" izni. Arka planda konum takibi YAPILMAZ.

## Supabase kurulumu (Claude Code yapar)
- Supabase ayarlarını Supabase CLI ile kendin yap: proje oluşturma, tabloları ve RLS güvenlik kurallarını migration olarak yazıp yükleme, Storage alanlarını açma, pg_cron işlerini kurma, bağlantı bilgilerini .env dosyasına yazma. Bu adımlar için kullanıcıya panelde tıklatma.
- Kullanıcının yapacağı tek şey giriş: supabase login'i başlat, tarayıcıda GitHub ya da Google hesabıyla onay vermesini iste ve bekle.
- CLI ile yapılamayan bir adım çıkarsa (ör. E-posta/Şifre girişinin ayarı), önce Supabase Management API ile dene; olmazsa kullanıcıya panelde en fazla 3 tıklamalık, ekran ekran tarif ver.
- Sadece ÜCRETSİZ plan kullanılır. Ücretli plan gerektiren hiçbir şey kurma; böyle bir ihtiyaç doğarsa dur ve kullanıcıya ücretsiz bir alternatif öner. Kart bilgisini asla isteme.
- Ücretsiz proje bir hafta hareketsiz kalınca duraklatıldığı için Faz 3'te projeyi birkaç günde bir uyandıran ücretsiz bir zamanlayıcı (GitHub Actions) kur.
- Bağlantı bilgileri .gitignore'daki .env dosyasında durur; koda ve git'e girmez. service_role anahtarı uygulamaya asla konmaz.

## Yüklü skill'ler ve plugin'ler
- Kullanıcının bilgisayarında global skill'ler kurulu: impeccable (arayüz tasarımı), superpowers (çalışma yöntemi), claude-mem (hafıza), find-skills, Remotion.
- Ekran yazan her fazda (Faz 1-6) impeccable skill'ini yükle ve ekranları onun ilkeleriyle tasarla. Renk, logo ve yazı karakterinde docs/tasarim/marka-kilavuzu.md, düzende docs/tasarim/referans-arayuz.jpeg önceliklidir; impeccable bunlarla çelişirse marka kılavuzu kazanır.
- Fazı bitirmeden önce yazılan ekranları impeccable ile bir kez gözden geçir ve bulduğun önemli sorunları düzelt.
- superpowers kullanılabilir, ama bu dosyadaki faz kuralları ondan önce gelir: tek seferde sadece söylenen faz yapılır, plan kısa ve sade Türkçe yazılır, onay beklenir. Git worktree açma; doğrudan proje klasöründe çalış. Kullanıcı yazılımcı olmadığı için uzun teknik plan belgeleri üretme.
- Uzun süreli bilgi için docs/ilerleme.md esastır; claude-mem yardımcıdır.
- Bu skill'lerden biri yüklü değilse dur ve kullanıcıya söyle; onsuz devam etmek için onay al.

## Çalışma kuralları
- Her yeni sohbette önce docs/ilerleme.md dosyasını oku; önceki fazlarda ne yapıldığı orada yazar.
- Faz bitince yapılanları, alınan kararları ve bilinen eksikleri docs/ilerleme.md dosyasına ekle ve git commit ile kayıt noktası oluştur.
- Her sohbette SADECE kendisine söylenen fazı yap. Sonraki fazın özelliklerine başlama.
- Fazın başında yapacaklarını madde madde yaz ve onay bekle.
- Belgede olmayan bir karar gerekirse tahmin etme; dur ve sor.
- Kullanıcı yazılımcı değil. Her fazın sonunda telefonda nasıl test edeceğini adım adım, sade Türkçeyle anlat.
- Fazın "bitti sayılma ölçütü" (Bölüm 6) sağlanmadan fazı bitmiş sayma.
- Uygulama hiçbir para hareketine aracılık etmez; ödeme veya bağış alma kodu yazma.
- Sağlık bilgisi, mazeret belgesi veya koordinat SAKLAMA (Bölüm 2, KVKK).
- Renkler, logo ve yazı karakteri için docs/tasarim/marka-kilavuzu.md dosyasına uy; renk kodlarını oradan al.
- Tasarım: Ekran yazan her fazın başında docs/tasarim klasörüne bak. O ekranın kendi tasarım dosyası varsa ona uy. Yoksa ekranı docs/tasarim/referans-arayuz.jpeg görselindeki düzenden ilhamla, marka kılavuzundaki renklerle tasarla (Bölüm 4, "Arayüz referansı"). Referansın yeşil renklerini asla kullanma; Gelgel paletine çevir.
- Logo: Faz 6'nın başında docs/tasarim/logo.png dosyasına bak. Yoksa kullanıcıdan iste; logo gelene kadar geçici bir ikon kullan ve bunu docs/ilerleme.md'ye eksik olarak yaz.
- Arayüz metinleri Türkçe ve sıcak tonda (Bölüm 4). "Ceza" kelimesi arayüzde kullanılmaz.

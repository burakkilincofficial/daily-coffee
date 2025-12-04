# Chrome "Tehlikeli Site" Uyarısı Çözümü

## Sorun
Chrome tarayıcısı siteyi "tehlikeli" olarak işaretliyor, ancak Edge ve mobil tarayıcılarda sorun yok. Bu, Chrome'un Safe Browsing veritabanının yanlış pozitif bir sonuç döndürmesidir.

## Çözüm Adımları

### 1. Google Safe Browsing'e Temizleme Talebi Gönderin

1. **Google Safe Browsing Status Sayfasına gidin:**
   - https://transparencyreport.google.com/safe-browsing/search
   - URL: `daily-coffee.vercel.app` yazın ve kontrol edin

2. **Eğer site işaretlenmişse:**
   - https://search.google.com/search-console adresine gidin
   - Google hesabınızla giriş yapın
   - "Add Property" butonuna tıklayın
   - `https://daily-coffee.vercel.app` ekleyin
   - Doğrulama yapın (DNS veya HTML tag ile)
   - "Security Issues" bölümünden temizleme talebi gönderin

### 2. Chrome'da Geçici Çözüm (Kullanıcılar İçin)

Kullanıcılar şu adımları izleyebilir:

1. Chrome'da siteye gitmeye çalıştıklarında "Ayrıntılar" butonuna tıklasınlar
2. "Bu siteye yine de git" seçeneğini seçsinler
3. Veya Chrome ayarlarından:
   - `chrome://settings/security`
   - "Safe Browsing" ayarlarını kontrol edin

### 3. Vercel'de Kontrol Edin

1. Vercel Dashboard → Projeniz → Settings → Domains
2. HTTPS'nin aktif olduğundan emin olun
3. "Force HTTPS" seçeneğinin açık olduğundan emin olun
4. SSL sertifikasının geçerli olduğunu kontrol edin

### 4. Google Search Console'a Site Ekleyin

1. https://search.google.com/search-console
2. Site ekleyin ve doğrulayın
3. "Security Issues" bölümünü kontrol edin
4. Eğer sorun varsa, "Request Review" butonuna tıklayın

### 5. Bekleme Süresi

- Google genellikle 24-48 saat içinde temizleme talebini işler
- Bazen 1 haftaya kadar sürebilir
- Bu süre zarfında kullanıcılar geçici çözümü kullanabilir

## Notlar

- Edge ve mobil tarayıcılarda sorun yoksa, bu kesinlikle Chrome'un Safe Browsing veritabanı sorunudur
- Vercel otomatik olarak SSL sertifikası sağlar, bu yüzden sertifika sorunu değildir
- Site gerçekten güvenli, sadece Google'ın veritabanını güncellemesi gerekiyor


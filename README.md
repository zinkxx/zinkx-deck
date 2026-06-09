# 🖥️ ZinkxDeck - Geliştiriciler İçin Hızlı Yardımcı Araç Kutusu

**ZinkxDeck**, macOS işletim sistemi için özel olarak tasarlanmış, geliştiricilerin günlük iş akışlarında en sık kullandığı biçimlendirme, şifreleme ve yardımcı araçları tek bir şık ve yerel (local) arayüzde toplayan premium bir masaüstü uygulamasıdır.

[English Description Below](#english)

---

## 🎨 Tasarım ve Arayüz Özellikleri
*   **macOS Entegrasyonu:** Çerçevesiz (frameless) pencere tasarımı ve yerel macOS trafik ışıkları kontrolleri.
*   **Cam Efekti (Glassmorphism):** Saydam paneller, bulanık arka planlar (`backdrop-filter`) ve derinlik hissi.
*   **Mac Dock Tarzı Menü:** Sol tarafta akıcı süzülme animasyonuna (hover capsules) sahip gezinti barı.
*   **Ortam Işığı (Ambient Glow):** Seçtiğiniz temaya göre arka planda yumuşak bir şekilde parlayan neon ortam parıltısı.
*   **Premium Temalar:** Slate (Uzay Grisi), Dracula (Karanlık Pembe), Cyberpunk (Neon Mor) ve Nord (Buzul Mavisi) tema destekleri.
*   **Mikro Animasyonlar:** Kopyalama esnasında yukarıdan süzülen Toast bildirimleri, buton hover hareketleri ve geçiş efektleri.

---

## ⚡ Temel Özellikler

1.  **%100 Çevrimdışı ve Güvenli:** Verileriniz asla bilgisayarınızdan dışarı çıkmaz. API anahtarlarınızı, JWT token'larınızı veya veritabanı JSON verilerinizi üçüncü taraf web sitelerine göndermeden tamamen yerel olarak işleyin.
2.  **Her Zaman Üstte Sabitleme (Always-on-Top):** Kod yazarken pencereler arasında kaybolmamak için ZinkxDeck'i en önde sabitleyin.
3.  **Pencere Şeffaflığı (Opacity):** Uygulamanın saydamlığını ayarlayarak arka plandaki kodunuzu görecek şekilde üzerine yerleştirin.
4.  **Komut Paleti (CMD + K):** Klavyenizden elinizi kaldırmadan `⌘K` tuşları ile tüm araçlar arasında saniyeler içinde arama yapıp geçiş yapın.
5.  **Akıllı Pano Tespiti:** Panonuza bir JWT token, JSON veya Base64 metin kopyaladığınızda, ZinkxDeck bunu otomatik algılar ve ilgili aracı açmanız için sağ altta bir bildirim sunar.
6.  **Çoklu Dil Desteği:** Sol alttaki tek tıkla tüm arayüzü **Türkçe** veya **İngilizce** yapabilirsiniz.
7.  **Detaylı Veri Sayaçları:** Tüm metin girdi alanlarında anlık karakter, kelime ve satır sayaçları yer alır.

---

## 🛠️ Barındırdığı Araçlar (12 Adet)
*   **JSON Formatter & Validator:** JSON verilerini güzelleştirin, minize edin veya sözdizimi hatalarını canlı yakalayın.
*   **SQL Formatter:** SQL sorgularını hizalayarak okunabilirliği artırır ve dialect seçimi sunar.
*   **Base64 Encoder/Decoder:** Unicode metinleri Base64 formatına çevirin veya çözümleyin.
*   **URL Encoder/Decoder:** Web adreslerindeki özel karakterleri kodlayın veya çözün.
*   **JWT Decoder:** Header ve Payload verilerini çözümler, JWT zaman aşımı süresini yerel saate göre hesaplar.
*   **Hash Generator:** MD5, SHA-1, SHA-256 ve SHA-512 şifreleme özetlerini anlık üretin.
*   **Regex Tester:** Düzenli ifadeleri test edin, eşleşen grupları ve kelimeleri canlı renklendirin.
*   **Color Converter:** HEX, RGB ve HSL formatlarını dönüştürün. macOS renk paletine doğrudan erişin.
*   **UUID & Şifre Üretici:** Rastgele UUID v4 kodları ve özel filtreli güçlü şifreler üretin.
*   **Diff Viewer:** İki metin arasındaki satır farklarını Git-benzeri görsel arayüzle karşılaştırın.
*   **Playground:** HTML, CSS ve JavaScript kod parçacıklarını yan yana yazıp sandboxed iframe'de anlık çalıştırın.
*   **Cron Parser:** Sunucu cron parametrelerini açık ve anlaşılır Türkçe/İngilizce ifadelere dönüştürün.

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için Node.js yüklü olmalıdır.

```bash
# Bağımlılıkları yükleyin
npm install

# Uygulamayı geliştirme modunda başlatın (Vite dev server + Electron)
npm start

# Üretim (production) sürümünü derleyin
npm run build
```

---

<a id="english"></a>

# 🖥️ ZinkxDeck - Developer Utility Toolbox for macOS

**ZinkxDeck** is a premium, offline-first desktop application designed specifically for macOS, consolidating formatting, encoding, cryptography, and playground utilities into a beautiful, native client.

---

## 🎨 Aesthetics & Interface Features
*   **macOS Native Feel:** Frameless window layout with native traffic lights placement on the upper-left.
*   **Glassmorphism Theme:** Translucent surfaces, blurred backdrops (`backdrop-filter`), and distinct elevation shadows.
*   **macOS Dock Sidebar:** Floating hover capsule animations for sidebar menu traversal.
*   **Ambient Glow:** Soft neon background glow matching the active theme's colors.
*   **Tailored Palettes:** Choose between Slate (Space Gray), Dracula (Cyberpunk Purple), Cyberpunk (Neon Pink), and Nord (Glacier Blue) themes.
*   **Micro-interactions:** Rich copy alerts sliding in from the top with animated timeout progress bars.

---

## ⚡ Core Functionality

1.  **100% Offline & Secure:** All data is processed locally on your machine. Never leak sensitive API keys, database entries, or JWT payloads to online formatters.
2.  **Always on Top Pinned:** Pinned workspace layout keeps ZinkxDeck on top of other editors (like VS Code) while you check regex patterns or format outputs.
3.  **Adjustable Transparency:** Modify window opacity from 20% to 100% to view code editors underneath.
4.  **CMD + K Command Palette:** Press `⌘K` to open a searchable navigation overlay to swap tools instantly.
5.  **Smart Clipboard Detection:** Auto-analyzes clipboard data. If a JWT token, JSON structure, or Base64 string is found, a prompt appears to direct you to the right tool.
6.  **i18n Language Toggle:** Swap the entire UI instantly between English and Turkish.
7.  **Input Counters:** Real-time counters showing character, word, and line count for all input textareas.

---

## 🚀 How to Run Locally

Ensure you have Node.js installed.

```bash
# Install package dependencies
npm install

# Run Vite dev server and launch Electron window
npm start

# Build compiled files for distribution
npm run build
```

---

## 📄 Lisans / License
MIT License.

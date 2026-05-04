# BÖLÜM 1: Backend Mimarisi ve İstek Akışı ⚙️

Projemizin Backend (Sunucu) tarafı **Node.js** ortamında **Express.js** framework'ü kullanılarak geliştirilmiştir. 
Piyasada çok sık kullanılan *"Supabase'i doğrudan frontend'den çağırma"* kolaya kaçma yöntemi yerine, araya gerçek bir **API Katmanı (Gateway/Backend)** koyduk. 

### Görsel Mimari Haritası (Bir İstek Nasıl İşlenir?)

```mermaid
graph TD
    Client[Frontend / Tarayıcı] -->|HTTP İstekleri / JWT Token| Express[Node.js - server.js]
    Express -->|Yönlendirme| Routers[Routes klasörü: auth, classes, vb.]
    Routers -->|Güvenlik Kontrolü Noktası| Middleware[auth.js / requireAdmin.js]
    Middleware -->|İzin Verildi (Next)| Logic[İş Mantığı & Veri İşleme]
    Logic -->|Veritabanı Sorgusu| Supabase[(Supabase Veritabanı ve Auth)]
    Logic -->|Gizli / Proxy İstek| APINinjas((API Ninjas Egzersiz))
```

### Klasör ve Dosya Yapısının Görevleri:
1. **`server.js` (Ana Şalter/Kalp):** Uygulamanın başladığı yerdir. Sunucuyu (port 3000) ayağa kaldırır, CORS (çapraz kaynak paylaşımı) ayarlarını yapar ve gelen istekleri ilgili Route'lara (yollara) dağıtır.
2. **`routes/` Klasörü:** Hangi URL'e girilirse hangi kodun çalışacağını belirler. (Örn: `/api/bookings` isteği gelirse `bookings.js` dosyası ilgilenir).
3. **`middleware/` Klasörü (Güvenlik Görevlileri):** Gelen isteğin içeriye girmeden önce durdurulup kontrol edildiği ara katmanlardır. Token var mı? Kişi Admin mi?
4. **`supabase.js`:** Veritabanına olan bağlantının kurulduğu konfigürasyon dosyasıdır.

---

# BÖLÜM 2: Bilinmesi Gereken Zor Kavramlar 🧠

Sunumda Backend ile ilgili sorulabilecek en kritik teknik soruların cevapları:

### 1. RESTful API ve HTTP Metotları
Biz projemizde REST mimarisini (Representational State Transfer) benimsedik. Yani URL'lerimiz fiil değil isimdir (Örn: `/api/classes`). Ne yapılacağını HTTP metodu belirler:
*   **GET**: Veri okumak / çekmek için.
*   **POST**: Yeni bir veri oluşturmak için (Örn: Rezervasyon yapmak, Kayıt olmak).
*   **PUT**: Var olan bir veriyi güncellemek için.
*   **DELETE**: Bir veriyi silmek için.

### 2. Middleware (Ara Katman) Mantığı
Middleware'ler gelen istek (Request - `req`) ile giden cevap (Response - `res`) arasına giren güvenlik görevlileridir. Eğer istek kurallara uyuyorsa kapıyı açıp isteği asıl fonksiyona geçirirler (`next()` komutu ile). Uymuyorsa `401 Unauthorized (Yetkisiz)` veya `403 Forbidden (Yasak)` hatası fırlatırlar.

### 3. JWT (JSON Web Token) ve Custom Auth
Supabase'in kendi oturum yönetimini frontend'de kullanmak yerine, Backend'imizde kendi **JWT (JSON Web Token)**'larımızı ürettik. Neden?
Çünkü sistemi dışa bağımlılıktan kurtarıp, tam kontrolü kendi Express.js sunucumuzun eline almak istedik. Kullanıcı Supabase ile giriş yapınca, ona kendi imzamızı taşıyan bir JWT veriyoruz. Sonraki tüm isteklerde bu JWT'yi kontrol ediyoruz.

### 4. API Proxy (Gizleme) Deseni
Uygulamamızdaki egzersizleri getiren `API Ninjas` servisi ücretli/kotalı bir servistir. Eğer bunun API Key'ini frontend'e yazsaydık tüm dünya bu anahtarı görebilirdi. 
**Çözüm:** İstekleri önce kendi backend'imize (`/api/exercises`) attık, bizim backend'imiz gizli `.env` dosyasındaki anahtarı kullanarak API Ninjas'a sordu ve sonucu frontend'e iletti. Buna **Proxy Pattern (Vekil Sunucu)** denir.

---

# BÖLÜM 3: Backend Kodundan Gerçek Örnekler 💻

Aşağıda backend'imizde kurduğumuz yapıların kod ile anlatımları mevcuttur.

### 1. Route Tanımlama (server.js)
**Genel Mantık:** Ana kapıdan giren trafiği uygun departmanlara (dosyalara) yönlendirmek.
**Bizim Projede:**
```javascript
/* server.js içinden */
const express = require('express');
const classesRoutes = require('./routes/classes'); // İlgili dosyayı içe aktar

const app = express();
app.use(express.json()); // Gelen isteklerdeki JSON verilerini okuyabilmek için

// Eğer url /api/classes ile başlıyorsa, bu işi classesRoutes dosyasına devret
app.use('/api/classes', classesRoutes); 
```
*Sunumda ne demelisin?* -> "Tüm kodu tek bir server.js dosyasına yığmak yerine (Monolithic), projeyi Router'lar ile modüllere böldük. Bu kodun okunabilirliğini ve yönetilebilirliğini artırdı."

### 2. Middleware ve Güvenlik (auth.js)
**Genel Mantık:** Bir URL'ye herkesin girmesini engellemek!
**Bizim Projede:**
```javascript
/* middleware/auth.js içinden */
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Gelen isteğin başlığından token'ı bul
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];

  // Token yoksa 401 hatası ver!
  if (!token) return res.status(401).json({ error: 'Token gerekli.' });

  try {
    // Kendi JWT_SECRET şifremizle token'ın sahte olup olmadığını doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // İstek yapan kullanıcının bilgilerini req içerisine kaydet
    next(); // Geçişe izin ver
  } catch (err) {
    return res.status(403).json({ error: 'Geçersiz token.' });
  }
};
```

### 3. Rol Bazlı Erişim ve requireAdmin
**Bizim Projede:**
```javascript
/* middleware/requireAdmin.js içinden */
module.exports = function requireAdmin(req, res, next) {
  // Giriş yapmış kullanıcının rolü admin değilse hata fırlat
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Sadece adminler bu işlemi yapabilir.' });
  }
  next();
};

/* routes/classes.js -> İKİ YANDAN KORUMALI ENDPOINT YAZMAK */
// Sadece giriş yapanlar (authMiddle) VE sadece admin olanlar (requireAdmin) yeni ders ekleyebilir
router.post('/', authMiddle, requireAdmin, async (req, res) => {
   // Supabase'e insert at...
});
```
*Sunumda ne demelisin?* -> "Admin yetkisi gerektiren Route'larımızı Middleware zincirleme yöntemiyle koruduk. Frontend'de menüyü gizlemek tek başına güvenlik değildir. Asıl güvenlik backend'de gelen isteği `req.user.role` ile doğrulamaktır."

### 4. İş Mantığı (Business Logic): Üyelik Satın Alma
Backend sadece veritabanına kayıt atmaz, işlem yapar.
**Bizim Projede:**
```javascript
/* routes/memberships.js içinden */
router.post('/', authMiddle, async (req, res) => {
  const { plan_name, billing } = req.body;
  
  // 1. Hesaplama (Business Logic): Yıllık mı aylık mı?
  const months    = billing === 'annual' ? 12 : 1;
  const startDate = new Date();
  const endDate   = new Date();
  endDate.setMonth(endDate.getMonth() + months); // Bitiş tarihini otomatik hesapla

  // 2. Güvenlik: Kullanıcının zaten aktif olan başka paketi varsa onu iptal et (Çakışmayı önle)
  await supabase
    .from('memberships')
    .update({ status: 'cancelled' })
    .eq('user_id', req.user.id)
    .eq('status', 'active');

  // 3. Yazma: Yeni üyeliği başlat
  const { data, error } = await supabase.from('memberships').insert({
      user_id:    req.user.id,
      start_date: startDate.toISOString(),
      end_date:   endDate.toISOString(),
      status:     'active'
  });
});
```

---

### Özetle Hazırlık (Bir Soru Gelirse Ne Diyeceksin?)

**Soru:** *Supabase zaten "Backend as a Service (BaaS)" olarak geçiyor. Veritabanına frontend üzerinden doğrudan (api.js içinden Supabase komutlarıyla) erişebilecekken neden araya Node.js / Express yazdınız?*

**Muhteşem Cevap:** *"Güvenlik ve İş Mantığı (Business Logic) merkeziyeti için!*
*1) API Ninjas gibi 3. parti API kullanan yerlerde API Secret Key'leri Frontend'e koymak büyük güvenlik zafiyetidir.*
*2) Bir üyelik alınacağı zaman 'önceki üyeliği iptal et, 12 ay süre hesapla, yeni üyeliği kaydet' gibi Transaction benzeri durumların, kötü niyetli müdahalelere kapalı, merkezi ve kontrol edilebilir bir sunucuda yapılması şarttır.*
*3) Express kullanarak sistemi ileride PostgreSQL, MongoDB gibi farklı bir veritabanına taşımak istediğimizde Frontend'de hiçbir kodu değiştirmek zorunda kalmayacağımız, tamamen ölçeklenebilir (Scalable) bir mimari yaratmış olduk."*
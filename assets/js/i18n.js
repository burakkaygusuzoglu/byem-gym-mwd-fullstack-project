/* ============================================================
   BYEM GYM — i18n.js
   UI-only translation layer (TR default, EN toggle)
   ============================================================ */

(function () {
  const LANG_KEY = 'byem_lang';

  const EXACT_MAP = {
    'Cikis': 'Logout',
    'Çıkış': 'Logout',
    'Menü': 'Menu',
    'Giriş Yap': 'Login',
    'Üye Ol': 'Sign Up',
    'Özellikler': 'Features',
    'Üyelik': 'Membership',
    'Rezervasyon': 'Booking',
    'Egzersizler': 'Exercises',
    'Profilim': 'My Profile',
    'Dashboard': 'Dashboard',
    'Admin': 'Admin',
    'Tekrar Hoşgeldin': 'Welcome Back',
    'Hesabına giriş yap ve antrenmana devam et.': 'Log in to your account and continue your training.',
    'E-posta': 'Email',
    'Şifre': 'Password',
    'Hesabın yok mu?': 'Don\'t have an account?',
    'Hesap Oluştur': 'Create Account',
    'Ücretsiz kaydol, antrenmana hemen başla.': 'Sign up for free and start training now.',
    'Ad': 'First Name',
    'Soyad': 'Last Name',
    'Şifre Tekrar': 'Confirm Password',
    'Zaten hesabın var mı?': 'Already have an account?',
    'Hoşgeldin,': 'Welcome,',
    'Rezervasyonum': 'My Bookings',
    'Egzersiz': 'Exercise',
    'Gün Kaldı': 'Days Left',
    'Üyelik Ayı': 'Membership Months',
    'Üyelik Planım': 'My Membership Plan',
    'Aktif': 'Active',
    'Üyelik Yok': 'No Membership',
    'Başlangıç': 'Start',
    'Bitiş': 'End',
    'İlerleme': 'Progress',
    'Plan Yönet': 'Manage Plan',
    'Yaklaşan Derslerim': 'My Upcoming Classes',
    '+ Rezervasyon': '+ Booking',
    'Henüz rezervasyonun yok.': 'You do not have any bookings yet.',
    'Hızlı Erişim': 'Quick Access',
    'Ders Rezervasyon': 'Class Booking',
    'Egzersiz Rehberi': 'Exercise Guide',
    'Üyelik Planları': 'Membership Plans',
    'Profil Özeti': 'Profile Summary',
    'Düzenle': 'Edit',
    'Rol': 'Role',
    'Kayıt Tarihi': 'Registration Date',
    'Ders Rezervasyonu': 'Class Booking',
    'Filtrele:': 'Filter:',
    'Tüm Dersler': 'All Classes',
    'Tüm Günler': 'All Days',
    'Temizle': 'Clear',
    'Dersler yükleniyor...': 'Loading classes...',
    'Rezervasyonlarım': 'My Bookings',
    'Rezervasyon Onayla': 'Confirm Booking',
    'Aşağıdaki derse kaydolmak istediğinden emin misin?': 'Are you sure you want to register for the class below?',
    'Eğitmen': 'Instructor',
    'Tarih & Saat': 'Date & Time',
    'Kapasite': 'Capacity',
    'Vazgeç': 'Cancel',
    'Rezervasyon Yap': 'Book Class',
    'Sana Uygun Planı Seç': 'Choose the Right Plan for You',
    'Hedefine ulaşmak için en iyi planı seç. İstediğin zaman iptal et.': 'Choose the best plan to reach your goal. Cancel anytime.',
    'Aylık': 'Monthly',
    'Yıllık': 'Yearly',
    '%20 İndirim': '20% OFF',
    'Planı İptal Et': 'Cancel Plan',
    'Planı Seç': 'Select Plan',
    'Sık Sorulan Sorular': 'Frequently Asked Questions',
    'Sık Sorulan': 'Frequently Asked',
    'Sorular': 'Questions',
    'Planı Onayla': 'Confirm Plan',
    'Seçtiğin plan aşağıda özetlendi. Onaylamak için devam et.': 'Your selected plan is summarized below. Continue to confirm.',
    'Onayla': 'Confirm',
    'Temel': 'Basic',
    'Klasik': 'Classic',
    'Temel Plan': 'Basic Plan',
    'Klasik Plan': 'Classic Plan',
    'Elite Plan': 'Elite Plan',
    '⭐ En Popüler': '⭐ Most Popular',
    'En Popüler': 'Most Popular',
    'Spor salonuna ilk adımını atanlar için.': 'For those taking their first step into the gym.',
    'Düzenli spor yapanlar için tam donanımlı paket.': 'A fully equipped package for regular training.',
    'Maksimum performans için eksiksiz deneyim.': 'A complete experience for maximum performance.',
    'Spor salonu erişimi': 'Gym access',
    'Soyunma odası kullanımı': 'Locker room access',
    'Temel ekipman erişimi': 'Basic equipment access',
    'Tüm ekipman erişimi': 'All equipment access',
    'Grup dersleri': 'Group classes',
    'Grup dersleri (sınırsız)': 'Group classes (unlimited)',
    'Kişisel antrenör': 'Personal trainer',
    'Aylık 4 kişisel antrenör': '4 personal trainer sessions monthly',
    'Misafir getirme hakkı': 'Guest pass privilege',
    'İstediğim zaman iptal edebilir miyim?': 'Can I cancel anytime?',
    'Plan değiştirebilir miyim?': 'Can I change my plan?',
    'Yıllık planda indirim nasıl işliyor?': 'How does the yearly discount work?',
    'Grup derslerine nasıl katılabilirim?': 'How can I join group classes?',
    'Evet, planınızı istediğiniz zaman iptal edebilirsiniz. İptal işlemi sonraki fatura döneminden itibaren geçerli olur.': 'Yes, you can cancel your plan anytime. Cancellation takes effect from the next billing period.',
    'Evet, mevcut planınızı istediğiniz zaman yükseltebilir veya düşürebilirsiniz. Fark tutarı orantılı olarak hesaplanır.': 'Yes, you can upgrade or downgrade your current plan anytime. The price difference is calculated proportionally.',
    'Yıllık plan seçtiğinizde toplam ücret peşin olarak alınır ve aylık fiyata kıyasla %20 indirim uygulanır.': 'When you choose the yearly plan, the total fee is charged upfront and a 20% discount is applied compared to monthly pricing.',
    'Klasik veya Elite planınız varsa Rezervasyon sayfasından ders seçip online rezervasyon yapabilirsiniz.': 'If you have a Classic or Elite plan, you can select a class and book online from the Booking page.',
    'Pasif': 'Inactive',
    'Sona Eriyor': 'Expiring Soon',
    'Onaylı': 'Confirmed',
    'Üye': 'Member',
    'Üye Yap': 'Make Member',
    'Admin Yap': 'Make Admin',
    'Tüm alanları doldurun.': 'Please fill in all fields.',
    '✅ Ders eklendi!': '✅ Class added!',
    'Henüz ders eklenmedi.': 'No classes have been added yet.',
    'Üyelikler yükleniyor...': 'Loading memberships...',
    'Rezervasyonlar backend üzerinden yükleniyor...': 'Bookings are loading from backend...',
    'Bu dersi silmek istediğinden emin misin?': 'Are you sure you want to delete this class?',
    'Ders silindi.': 'Class deleted.',
    'Planınızı iptal etmek istediğinizden emin misiniz?': 'Are you sure you want to cancel your plan?',
    '✅ Plan başarıyla aktifleştirildi!': '✅ Plan activated successfully!',
    '✅ Rezervasyon başarıyla oluşturuldu!': '✅ Booking created successfully!',
    'Rezervasyon iptal edildi.': 'Booking canceled.',
    'Şifre güncellenemedi.': 'Password could not be updated.',
    'En az 6 karakter': 'At least 6 characters',
    'Şifreni tekrar gir': 'Re-enter your password',
    'Adın': 'Your first name',
    'Soyadın': 'Your last name',
    'Egzersiz ara...': 'Search exercises...',
    'Eğitmen adı': 'Instructor name',
    'Hazır mısın?': 'Are you ready?',
    'Ücretsiz hesap oluştur, tüm özellikleri keşfet.': 'Create a free account and explore all features.',
    'Üye Ol — Ücretsiz': 'Sign Up — Free',
    'Modern Spor Yönetimi': 'Modern Gym Management',
    'Üyelik takibinden ders rezervasyonuna, egzersiz planlarından admin paneline —\n        BYEM GYM ile spor merkezi yönetimi artık çok daha kolay.': 'From membership tracking to class booking, from exercise plans to admin panel —\n        managing your gym is now much easier with BYEM GYM.',
    'Hemen Başla': 'Get Started',
    'Keşfet': 'Explore',
    'Aktif Üye': 'Active Members',
    'Haftalık Ders': 'Weekly Classes',
    'Uzman Eğitmen': 'Expert Trainers',
    'Tüm İhtiyaçlar': 'All Your Needs',
    'Tek Platformda': 'On One Platform',
    'Üyeler ve yöneticiler için eksiksiz bir spor merkezi deneyimi.': 'A complete gym experience for members and administrators.',
    'Kolay Kayıt': 'Easy Registration',
    'Hızlı kayıt ve güvenli giriş ile saniyeler içinde sisteme dahil ol.': 'Join the system in seconds with quick registration and secure login.',
    'Aylık, 3 aylık ve yıllık paketler arasından en uygun planı seç.': 'Choose the most suitable plan among monthly, 3-month, and yearly packages.',
    'Yoga, CrossFit, Spinning — istediğin derse online olarak yer ayırt.': 'Yoga, CrossFit, Spinning — reserve your spot online for any class you want.',
    '1300+ egzersizi keşfet, vücut bölgesine ve hedefe göre filtrele.': 'Discover 1300+ exercises and filter by muscle group and goal.',
    'Profil Takibi': 'Profile Tracking',
    'Üyelik sürenini, geçmiş rezervasyonlarını ve bilgilerini yönet.': 'Manage your membership duration, booking history, and personal details.',
    'Dersleri düzenle, üyelikleri yönet, sistemi tam kontrol altında tut.': 'Manage classes, memberships, and keep the whole system under control.',
    'Kişisel Bilgiler': 'Personal Information',
    'Üyelik Durumu': 'Membership Status',
    'Güvenlik': 'Security',
    'Kaydet': 'Save',
    'E-posta değiştirilemez.': 'Email cannot be changed.',
    'Plan Değiştir': 'Change Plan',
    'Yeni Şifre': 'New Password',
    'Şifreyi Güncelle': 'Update Password',
    'Tehlikeli Bölge': 'Danger Zone',
    'Oturumu kapat ve tüm cihazlardan çıkış yap.': 'End your session and sign out from all devices.',
    'Tüm Cihazlardan Çıkış': 'Sign Out from All Devices',
    'Plan': 'Plan',
    'Durum': 'Status',
    'Kalan Gün': 'Days Left',
    'Admin Paneli': 'Admin Panel',
    'Sistemi yönet, dersleri düzenle, üyeleri takip et.': 'Manage the system, classes, and members.',
    'Toplam Üye': 'Total Members',
    'Aktif Üyelik': 'Active Memberships',
    'Aktif Ders': 'Active Classes',
    'Dersler': 'Classes',
    'Üyeler': 'Members',
    'Üyelikler': 'Memberships',
    'Rezervasyonlar': 'Bookings',
    'Yeni Ders Ekle': 'Add New Class',
    'Ders Adı': 'Class Name',
    'İşlem': 'Action',
    'Yükleniyor...': 'Loading...',
    'Kayıtlı Üyeler': 'Registered Members',
    'Ad Soyad': 'Full Name',
    'Aktif Üyelikler': 'Active Memberships',
    'Kullanıcı': 'User',
    'Tüm Rezervasyonlar': 'All Bookings',
    'Erişim Reddedildi': 'Access Denied',
    'Bu sayfaya sadece admin rolündeki kullanıcılar erişebilir.': 'Only users with the admin role can access this page.',
    "Dashboard'a Dön": 'Return to Dashboard',
    'Dersler yüklenemedi.': 'Classes could not be loaded.',
    'Bu filtreye uygun ders bulunamadı.': 'No classes match this filter.',
    'Dolu': 'Full',
    'Kontenjan Dolu': 'No Spots Left',
    'İptal Et': 'Cancel',
    'Detay bilgisi mevcut değil.': 'No detailed information available.',
    'Sonuç bulunamadı. Farklı bir arama deneyin.': 'No results found. Try a different search.',
    "API bağlantısı kurulamadı. API key'ini kontrol et.": 'API connection failed. Check your API key.',
    'Daha Fazla Yükle': 'Load More',
    'Kapat': 'Close',
    'Ara': 'Search',
    'Tüm Kaslar': 'All Muscles',
    'Tüm Seviyeler': 'All Levels',
    'Başlangıç': 'Start',
    'Orta': 'Intermediate',
    'İleri': 'Advanced',
    'Pazartesi': 'Monday',
    'Salı': 'Tuesday',
    'Çarşamba': 'Wednesday',
    'Perşembe': 'Thursday',
    'Cuma': 'Friday',
    'Cumartesi': 'Saturday',
    'Pazar': 'Sunday',
    'Göğüs': 'Chest',
    'Sırt (Orta)': 'Back (Middle)',
    'Sırt (Alt)': 'Back (Lower)',
    'Sırt (Lat)': 'Back (Lats)',
    'Omuzlar': 'Shoulders',
    'Ön Kol': 'Forearms',
    'Baldır': 'Calves',
    'Kalça': 'Glutes',
    'Karın': 'Abs',
    'Boyun': 'Neck',
    'language.label': 'Language',
    'language.current': 'Current language: Turkish',
    'language.toggle': 'Switch to English'
  };

  const REGEX_MAP = [
    { regex: /^(\d+)\s+yer\s+kaldı$/i, replacement: '$1 spots left' },
    { regex: /^(\d+)\s+kişilik$/i, replacement: '$1 capacity' },
    { regex: /^(\d+)\s+kişi$/i, replacement: '$1 people' },
    { regex: /^(\d+)\s+gün$/i, replacement: '$1 days' },
    { regex: /^Rol\s+güncellendi:\s*(\w+)$/i, replacement: 'Role updated: $1' },
    { regex: /^Yıllık:\s*(.+)$/i, replacement: 'Yearly: $1' },
    { regex: /^₺\s*\/\s*ay$/i, replacement: 'TRY / month' },
    { regex: /^Üyelik\s+takibinden\s+ders\s+rezervasyonuna,\s+egzersiz\s+planlarından\s+admin\s+paneline\s+—\s+BYEM\s+GYM\s+ile\s+spor\s+merkezi\s+yönetimi\s+artık\s+çok\s+daha\s+kolay\.$/i, replacement: 'From membership tracking to class booking, from exercise plans to admin panel, managing your gym is now much easier with BYEM GYM.' }
  ];

  function getLang() {
    return localStorage.getItem(LANG_KEY) || 'tr';
  }

  function getLocale() {
    return getLang() === 'en' ? 'en-US' : 'tr-TR';
  }

  function setLang(lang, options) {
    const next = (lang === 'en') ? 'en' : 'tr';
    localStorage.setItem(LANG_KEY, next);
    const shouldReload = !(options && options.reload === false);
    if (shouldReload) {
      window.location.reload();
      return;
    }
    applyI18n();
  }

  function translateText(text) {
    if (!text || getLang() !== 'en') return text;
    const trimmed = text.trim();
    if (!trimmed) return text;

    if (Object.prototype.hasOwnProperty.call(EXACT_MAP, trimmed)) {
      return text.replace(trimmed, EXACT_MAP[trimmed]);
    }

    for (const rule of REGEX_MAP) {
      if (rule.regex.test(trimmed)) {
        return text.replace(trimmed, trimmed.replace(rule.regex, rule.replacement));
      }
    }

    return text;
  }

  function translateNodeText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const updates = [];
    let node;
    while ((node = walker.nextNode())) updates.push(node);

    updates.forEach((textNode) => {
      const translated = translateText(textNode.nodeValue);
      if (translated !== textNode.nodeValue) textNode.nodeValue = translated;
    });
  }

  function translateAttributes(root) {
    root.querySelectorAll('[placeholder],[title],[aria-label]').forEach((el) => {
      ['placeholder', 'title', 'aria-label'].forEach((attr) => {
        const value = el.getAttribute(attr);
        if (!value) return;
        const translated = translateText(value);
        if (translated !== value) el.setAttribute(attr, translated);
      });
    });
  }

  function patchDialogs() {
    if (window.__i18nDialogsPatched) return;
    window.__i18nDialogsPatched = true;

    const nativeConfirm = window.confirm.bind(window);
    const nativeAlert = window.alert.bind(window);

    window.confirm = function (message) {
      const translated = translateText(String(message || ''));
      return nativeConfirm(translated);
    };

    window.alert = function (message) {
      const translated = translateText(String(message || ''));
      return nativeAlert(translated);
    };
  }

  function applyI18n(root) {
    const target = root || document.body;
    document.documentElement.lang = getLang();

    if (getLang() === 'tr') return;

    translateAttributes(document);
    translateNodeText(target);

    const $label = document.getElementById('languageCurrentLabel');
    const $toggle = document.getElementById('languageToggleBtn');
    if ($label) $label.textContent = 'Current language: English';
    if ($toggle) $toggle.textContent = 'Switch to Turkish';

    const difficultySelect = document.getElementById('filterDifficulty');
    if (difficultySelect) {
      const difficultyLabels = {
        '': 'All Levels',
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        expert: 'Advanced'
      };
      Array.from(difficultySelect.options).forEach((opt) => {
        if (Object.prototype.hasOwnProperty.call(difficultyLabels, opt.value)) {
          opt.textContent = difficultyLabels[opt.value];
        }
      });
    }
  }

  function observeDynamicContent() {
    if (!document.body || window.__i18nObserver) return;

    const observer = new MutationObserver((mutations) => {
      if (getLang() !== 'en') return;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) return;
          if (node.nodeType === Node.ELEMENT_NODE) applyI18n(node);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.__i18nObserver = observer;
  }

  window.getLang = getLang;
  window.setLang = setLang;
  window.getLocale = getLocale;
  window.t = function (key) {
    if (getLang() === 'tr') return key;
    return Object.prototype.hasOwnProperty.call(EXACT_MAP, key) ? EXACT_MAP[key] : key;
  };
  window.applyI18n = applyI18n;

  patchDialogs();
  document.addEventListener('DOMContentLoaded', function () {
    observeDynamicContent();
    applyI18n();
  });
})();

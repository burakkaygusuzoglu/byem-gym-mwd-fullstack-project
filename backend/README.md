# BYEM GYM — Backend API

Node.js + Express REST API

## Kurulum

```bash
cd backend
npm install
```

## Çalıştırma

```bash
node server.js
```

API: `http://localhost:3000`

## Endpoints

### Auth
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | /api/auth/register | Kayıt ol |
| POST | /api/auth/login | Giriş yap (JWT döner) |
| GET | /api/auth/me | Kendi bilgileri |

### Classes
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/classes | Tüm dersler |
| GET | /api/classes/:id | Tek ders |
| POST | /api/classes | Ders ekle (admin) |
| PUT | /api/classes/:id | Ders güncelle (admin) |
| DELETE | /api/classes/:id | Ders sil (admin) |

### Bookings
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/bookings | Kendi rezervasyonları |
| POST | /api/bookings | Rezervasyon yap |
| DELETE | /api/bookings/:id | Rezervasyon iptal |

### Memberships
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/memberships/me | Aktif üyelik |
| POST | /api/memberships | Üyelik satın al |
| DELETE | /api/memberships/me | Üyelik iptal |

### Users
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/users | Tüm kullanıcılar (admin) |
| GET | /api/users/me | Kendi profili |
| PUT | /api/users/me | Profil güncelle |
| PUT | /api/users/:id/role | Rol değiştir (admin) |

## Authentication

JWT token kullan. Header'a ekle:
```
Authorization: Bearer <token>
```

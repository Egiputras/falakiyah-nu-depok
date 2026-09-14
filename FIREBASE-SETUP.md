# Setup Publikasi Artikel (Firebase)

Situs membaca artikel dari **Cloud Firestore**. Admin menulis artikel lewat
halaman `/admin` yang dilindungi **Firebase Authentication** (email + sandi).

## Langkah sekali setup (~5 menit)

1. **Buat project**: buka <https://console.firebase.google.com> → **Add project**
   → beri nama (mis. `falakiyah-nu-depok`) → selesaikan (Analytics boleh dilewati).

2. **Daftarkan Web App**: di halaman project → ikon **`</>`** (Web) → beri nama
   (mis. `situs`) → **Register app**. Akan muncul objek `firebaseConfig`
   (apiKey, authDomain, projectId, dst). **Salin nilai-nilai ini** dan kirim ke
   Claude, atau tempel sendiri ke `public/firebase-config.js`.

3. **Aktifkan Firestore**: menu **Build → Firestore Database** → **Create database**
   → mulai di mode **production** → pilih lokasi (mis. `asia-southeast2` Jakarta).

4. **Pasang Security Rules**: di Firestore → tab **Rules** → ganti seluruh isinya
   dengan blok di bawah → **Publish**:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /articles/{id} {
         allow read: if resource.data.published == true || request.auth != null;
         allow create, update, delete: if request.auth != null;
       }
     }
   }
   ```
   Artinya: publik hanya bisa **membaca** artikel yang sudah *published*; hanya
   admin yang **login** yang bisa menulis/mengubah/menghapus.

5. **Aktifkan login admin**: menu **Build → Authentication** → **Get started** →
   tab **Sign-in method** → aktifkan **Email/Password** → Save.
   Lalu tab **Users** → **Add user** → isi email + sandi admin (ini yang dipakai
   login di `/admin`).

## Setelah `firebase-config.js` terisi

- Buka `https://falakiyah-nu-depok.vercel.app/admin` → login dengan email/sandi admin.
- Tulis artikel → centang **Terbitkan** → **Simpan**. Artikel langsung muncul di
  bagian **Berita** halaman utama.
- Draf (tanpa centang Terbitkan) tersimpan tapi tidak tampil di situs.

## Catatan

- Nilai di `firebase-config.js` **aman bersifat publik** — keamanan dijaga oleh
  Security Rules + Authentication, bukan oleh kerahasiaan config.
- Jika config kosong, situs tetap berjalan normal memakai artikel bawaan.

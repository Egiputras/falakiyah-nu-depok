/*
  Konfigurasi Firebase untuk situs Lembaga Falakiyah NU Kota Depok.
  Nilai-nilai ini AMAN disimpan publik (bukan rahasia) — keamanan diatur lewat
  Firestore Security Rules + Firebase Authentication.

  Cara mengisi: Firebase Console > Project settings (ikon gerigi) >
  bagian "Your apps" > pilih Web app > salin objek firebaseConfig ke bawah ini.

  Selama apiKey masih kosong, situs berjalan normal memakai artikel bawaan
  (tidak error). Setelah diisi, situs otomatis menampilkan artikel dari database.
*/
window.FALAK_FB = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

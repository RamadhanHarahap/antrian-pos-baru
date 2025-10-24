# Sistem Antrian Modern
Selamat datang di Sistem Antrian Modern. Proyek ini dibangun dengan HTML, CSS, dan JavaScript murni.

## Cara Menggunakan
1.  **Unduh** atau clone seluruh folder proyek.
2.  **Buka file `pasien.html`** di browser (seperti Google Chrome atau Firefox) untuk tampilan utama.
3.  **Login sebagai Admin** melalui tautan di halaman utama, atau langsung buka file `admin.html`.
    * **Username:** `admin`
    * **Password:** `admin123`

## Fitur Utama
* **Halaman Pasien (`pasien.html`)**: Tampilan antrian real-time, tombol ambil nomor, dan slideshow iklan.
* **Halaman Admin (`admin.html`)**: Dashboard untuk memanggil antrian, mereset data, dan mengelola tampilan.
* **Persistent Data**: Menggunakan **Local Storage** untuk menyimpan data antrian dan pengaturan, sehingga data tidak hilang saat halaman di-refresh.
* **Responsif**: Tampilan dapat menyesuaikan dengan perangkat mobile maupun desktop.

## Struktur File
* `pasien.html`: Halaman utama untuk pengunjung.
* `admin.html`: Dashboard untuk pengelolaan admin.
* `css/style.css`: File styling untuk seluruh proyek.
* `js/pasien.js`: Logika untuk halaman pasien (mengambil nomor, menampilkan data).
* `js/admin.js`: Logika untuk halaman admin (memanggil antrian, mengatur tampilan).
* `assets/`: Folder untuk gambar logo dan slideshow.
# RepoChart

## 1. Ringkasan Produk
**RepoChart** adalah SaaS tools berbasis web yang membantu freelancer dan agensi digital marketing Indonesia mengubah data mentah CSV/Excel dari Meta Ads, Google Ads, dan TikTok Ads menjadi laporan klien yang profesional, branded, dan siap kirim dalam waktu kurang dari 5 menit.

## Masalah yang Diselesaikan
Freelancer digital marketing wajib membuat laporan bulanan untuk setiap klien. Saat ini mereka melakukannya secara manual: export CSV dari platform ads, copy-paste ke Google Slides atau Canva, tambahkan grafik satu per satu, lalu kirim ke klien. Proses ini memakan 2-4 jam per klien per bulan.

## Solusi
Upload CSV → sistem parsing otomatis → pilih grafik → tambah branding klien → export PDF branded selesai dalam 5 menit.

## List Fitur

## 1 Manajemen Klien
Tambah, edit, arsip klien

Simpan profil klien: nama, logo, warna brand (hex)

Riwayat laporan per klien

## 2 Upload & Parsing Data
- Upload file CSV dan Excel (.xlsx)

- Auto-deteksi kolom dan tipe data (angka / teks / tanggal)

- Preview data sebelum diproses

- Support format export dari: Meta Ads, Google Ads, TikTok Ads

## 3 Konfigurasi Grafik
- Pilih tipe grafik: Bar, Line, Pie, Donut

- Pilih sumbu X (label) dan sumbu Y (nilai) dari kolom yang terdeteksi

- Filter rentang tanggal

- Pemilihan metrik KPI yang akan ditampilkan

## 4 Generate Laporan
- KPI otomatis: total, rata-rata, delta % vs periode sebelumnya

- Grafik dengan branding warna klien

- Insight otomatis (AI-generated, Bahasa Indonesia) (fitur premium)

- Rekomendasi actionable untuk bulan berikutnya (fitur premium)

## 5 Branding & Export
- Upload logo klien

- Pilih warna brand klien (color picker)

- Template laporan A4 yang rapi dan profesional

- Export PDF 1 klik

- Share link laporan ke client via whatsapp

## Arsitektur Teknis

-Backend     : Laravel 11
-Frontend    : React.js + Tailwind CSS
-Grafik      : Chart.js atau ApexCharts
-PDF Export  : Browser print + file system
-AI Insight  : Gemini API
-Database    : MySQL
-Server      : Shared Hosting Hostinger
-Auth        : Laravel Sanctum + JWT
# DocuSpec AI PRD Generator 🚀

**DocuSpecAIPRDGenerator** adalah platform inovatif berbasi AI yang dirancang khusus untuk *Product Managers* (PM) dan *Software Developers/Engineers*. Aplikasi ini mempermudah, mempercepat, dan mengotomatiskan pembuatan **Product Requirements Document (PRD)** dengan standar industri yang tinggi.

Dibangun dengan teknologi AI dari Gemini dan diintegrasikan dengan sistem real-time Supabase, DocuSpec AI memastikan setiap spesifikasi produk Anda terstruktur dengan presisi, siap untuk langsung diimplementasikan oleh tim atau *AI Coding Assistants* (seperti Cursor, Claude, Windsurf, dsb).

---

## ✨ Fitur Utama

*   🤖 **AI-Powered PRD Generation:** Hasilkan PRD lengkap dan terstruktur hanya dengan memberikan *prompt* atau deskripsi singkat mengenai produk Anda.
*   📝 **Rich Text PRD Editor:** Editor dokumen yang interaktif dan *real-time* untuk menyesuaikan dan memperbaiki spesifikasi dengan mudah.
*   💳 **Sistem Kredit & Langganan (SaaS):** Dilengkapi sistem monetisasi (*Pro* & *Enterprise*) menggunakan poin kredit AI, terhubung dengan dashboard admin.
*   🛠️ **Manajemen Tim & Kolaborasi:** Undang anggota tim, kelola *role*, dan lacak aktivitas kolaborasi Anda dalam satu *workspace*.
*   📂 **Manajemen Folder & Workspace:** Atur semua dokumen proyek Anda dengan mudah menggunakan sistem folder yang rapi dan terstruktur.
*   💾 **Export ke PDF & Markdown:** Kemudahan dalam mendistribusikan dokumen. Anda dapat mengunduhnya dalam format PDF profesional atau format Markdown (*.md*) untuk developer.
*   🔐 **Role-Based Access Control (RBAC):** Keamanan setingkat industri menggunakan Supabase *Row Level Security* (RLS) untuk membedakan akses Admin/Developer dan User biasa.
*   🎨 **Desain Modern & Responsif:** Antarmuka (*User Interface*) premium dengan dukungan penuh untuk mode gelap (*Dark Mode*).

---

## 🛠️ Teknologi yang Digunakan

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS (Vanilla styling & Lucide Icons)
*   **Backend & Database:** Supabase (PostgreSQL, Auth, RLS, Storage)
*   **AI Engine:** Google Gemini AI API
*   **Deployment:** Mendukung environment Node.js dan edge functions.

---

## 🚀 Cara Menjalankan Secara Lokal

1.  **Kloning Repositori**
    ```bash
    git clone https://github.com/WalZetass-kar/DocuSpecAIPRDGenerator.git
    cd DocuSpecAIPRDGenerator
    ```

2.  **Instalasi Dependensi**
    Pastikan Anda sudah menginstal Node.js dan `npm` (atau `bun`/`yarn`).
    ```bash
    npm install
    ```

3.  **Pengaturan Environment Variables**
    Buat file `.env.local` di root folder dan masukkan kredensial berikut:
    ```env
    VITE_SUPABASE_URL=URL_SUPABASE_ANDA
    VITE_SUPABASE_ANON_KEY=ANON_KEY_SUPABASE_ANDA
    VITE_GEMINI_API_KEY=GEMINI_API_KEY_ANDA
    ```

4.  **Jalankan Server Development**
    ```bash
    npm run dev
    ```
    Aplikasi bisa diakses melalui `http://localhost:5173`.

---

## 👨‍💻 Tentang Pembuat

Aplikasi ini dikembangkan dan dimiliki secara eksklusif oleh **WalZetass-Kar**. Didesain dengan fokus pada performa, estetika UI/UX premium, dan fungsionalitas yang kuat untuk memenuhi kebutuhan standar manajemen produk perangkat lunak modern.

---
*© 2026 DocuSpecAIPRDGenerator. Built with ❤️ Owned by WalZetass-Kar.*

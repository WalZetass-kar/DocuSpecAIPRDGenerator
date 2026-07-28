# DocuSpec AI PRD Generator 🚀

**DocuSpecAIPRDGenerator** adalah platform inovatif berbasi AI yang dirancang khusus untuk *Product Managers* (PM) dan *Software Developers/Engineers*. Aplikasi ini mempermudah, mempercepat, dan mengotomatiskan pembuatan **Product Requirements Document (PRD)** dengan standar industri yang tinggi.

Dibangun dengan teknologi AI dari Gemini dan diintegrasikan dengan sistem real-time Supabase, DocuSpec AI memastikan setiap spesifikasi produk Anda terstruktur dengan presisi, siap untuk langsung diimplementasikan oleh tim atau *AI Coding Assistants* (seperti Cursor, Claude, Windsurf, dsb).

---

## ✨ Fitur Utama Level Enterprise

*   🤖 **AI-Powered 36-Section PRD Engine:** Generasi otomatis 36 seksi spesifikasi produk mendalam menggunakan **Gemini 3.6 Flash** (lengkap dengan *fallback chain* otomatis ke `gemini-2.0-flash` dan `gemini-pro-latest`).
*   🎨 **Full-Screen Studio PRD Workspace:** Editor bebas gangguan (*distraction-free workspace*) bergaya Notion & Linear dengan *TOC section filter*, *inline AI rewriting*, dan penanda kelengkapan persentase dokumen.
*   📊 **Visual Flowchart & System Architecture:** Render visual interaktif untuk *User Journey*, *Entity Relationship Diagram (ERD)*, dan arsitektur produk.
*   🔍 **Visual Diff History Viewer:** Bandingkan revisi versi dokumen (v1.0 vs v1.1) secara berdampingan dengan penyorotan teks penambahan (hijau) dan penghapusan (merah).
*   🎫 **1-Click GitHub Issues & Jira Exporter:** Unduh berkas CSV terformat siap *import* langsung menjadi tiket pekerjaan resmi di GitHub Projects, Jira Board, atau Trello.
*   🏢 **Custom Company Branding Exporter:** Kustomisasi nama perusahaan, logo, dan skema warna untuk dokumen ekspor **Microsoft Word (.docx)** dan **PDF**.
*   💳 **Presisi Pengurangan 36 Kredit AI:** Pengurangan 36 poin kredit secara otomatis dan *real-time* untuk pembuatan PRD 36 seksi.
*   🔐 **Role-Based Security (RBAC & RLS):** Keamanan hak akses pengguna biasa (*User*) vs pengembang (*Developer*) dengan Supabase RPC & RLS modal hapus pengguna.
*   ⚡ **Vercel SPA Deployment & Routing:** Dilengkapi `vercel.json` rewrite rules untuk eliminasi error 404 saat *refresh* di Vercel.

---

## 🛠️ Arsitektur & Teknologi

*   **Frontend:** React 18, TypeScript, Vite, Tailwind CSS (Vanilla Styling & Lucide Icons)
*   **Backend & Database:** Supabase (PostgreSQL, Auth, Row Level Security, Storage, RPC Procedures)
*   **AI Engine:** Google Gemini AI API (`gemini-flash-latest`, `gemini-2.0-flash`, `gemini-2.0-flash-lite`, `gemini-pro-latest`)
*   **Deployment:** Vercel SPA Rewrites + Environment Prefixing (`VITE_`, `GEMINI_`, `NEXT_PUBLIC_`)

---

## 🚀 Cara Menjalankan Secara Lokal

1.  **Kloning Repositori**
    ```bash
    git clone https://github.com/WalZetass-kar/DocuSpecAIPRDGenerator.git
    cd DocuSpecAIPRDGenerator
    ```

2.  **Instalasi Dependensi**
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

## 👨‍💻 Hak Cipta & Hak Milik

Aplikasi ini dirancang, dikembangkan, dan dimiliki secara eksklusif oleh **WalZetass-Kar**. Didesain dengan fokus pada estetika UI/UX tingkat tinggi dan fungsionalitas SaaS yang tangguh untuk kebutuhan manajemen produk profesional.

---
*© 2026 DocuSpecAIPRDGenerator. Built with ❤️ Owned by WalZetass-Kar.*

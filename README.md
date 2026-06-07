# Todo API : Express + MySQL

![REST API Illustration](https://miro.medium.com/1*y5m2WvS5B5gnM-bb1_v20A.png)

REST API sederhana untuk manajemen todo list, dibangun dengan Express.js dan MySQL. Proyek ini dirancang untuk belajar arsitektur MVC, middleware, dan pola-pola umum dalam membangun backend API.

---

## Daftar Isi

- [Instalasi & Menjalankan Proyek](#instalasi--menjalankan-proyek)
- [Struktur Proyek](#struktur-proyek)
- [API Endpoints](#api-endpoints)
- [Konsep Penting](#konsep-penting)
  1. [Kenapa Butuh Struktur MVC?](#1-kenapa-butuh-struktur-mvc)
  2. [Alur Request dari Postman ke Database](#2-alur-request-dari-postman-ke-database)
  3. [Middleware — Urutan dan Fungsinya](#3-middleware--urutan-dan-fungsinya)
  4. [Referensi Fungsi vs Eksekusi Fungsi](#4-referensi-fungsi-vs-eksekusi-fungsi)
  5. [next(err) dan Centralized Error Handler](#5-nexterr-dan-centralized-error-handler)
  6. [PUT vs PATCH — Konvensi vs Implementasi](#6-put-vs-patch--konvensi-vs-implementasi)
  7. [Destructuring Parameter di Model](#7-destructuring-parameter-di-model)

---

## Instalasi & Menjalankan Proyek

### 1. Clone dan install dependencies

```bash
git clone <url-repo>
cd <nama-folder>
npm install
```

### 2. Buat file `.env`

Buat file `.env` di root proyek (sejajar dengan `index.js`):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=todo_db
DB_PORT=3306
```

### 3. Siapkan database MySQL

Buat database dan tabel terlebih dahulu di MySQL:

```sql
CREATE DATABASE todo_db;

USE todo_db;

CREATE TABLE todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Jalankan server

```bash
node index.js
```

Server berjalan di `http://localhost:3000`.

---

## Struktur Proyek

```
├── src/
│   ├── config/
│   │   └── database.js       # Koneksi ke MySQL (connection pool)
│   ├── controller/
│   │   └── todoController.js # Logika request & response
│   ├── middleware/
│   │   ├── errorHandler.js   # Centralized error handler
│   │   └── validateTodo.js   # Validasi input sebelum masuk controller
│   ├── model/
│   │   └── Todo.js           # Query ke database
│   ├── routes/
│   │   └── routes.js         # Definisi endpoint & urutan middleware
│   └── app.js                # Setup Express (middleware global & routing)
├── index.js                  # Entry point — start server
├── package.json
└── .env
```

---

## API Endpoints

Base URL: `http://localhost:3000/api/todos`

| Method | Endpoint   | Deskripsi                      |
|--------|------------|-------------------------------|
| GET    | `/`        | Ambil semua todo               |
| GET    | `/:id`     | Ambil todo berdasarkan ID      |
| POST   | `/`        | Buat todo baru                 |
| PUT    | `/:id`     | Update semua field todo        |
| PATCH  | `/:id`     | Update status `completed` saja |
| DELETE | `/:id`     | Hapus todo                     |

**Query parameter GET `/`:**

```
GET /api/todos?completed=true   # filter hanya yang selesai
GET /api/todos?completed=false  # filter hanya yang belum selesai
```

**Contoh request body POST:**

```json
{
  "title": "Belajar Express",
  "description": "Pelajari routing dan middleware"
}
```

**Contoh request body PATCH:**

```json
{
  "completed": true
}
```

---

## Konsep Penting

### 1. Kenapa Butuh Struktur MVC?

**Bayangkan kode tanpa struktur:**

```javascript
// index.js — semua jadi satu
app.post("/todos", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: "Title required" });

  const [result] = await db.query("INSERT INTO todos (title) VALUES (?)", [title]);
  const [rows] = await db.query("SELECT * FROM todos WHERE id = ?", [result.insertId]);

  res.status(201).json(rows[0]);
});
```

File `index.js` akan berisi ratusan baris campuran validasi, query SQL, dan logika response. Ketika ada bug, kamu harus menelusuri seluruh file. Ketika ada perubahan query, kamu harus cari di tengah-tengah logika lain.

**Masalah yang muncul tanpa struktur:**

- **Sulit dibaca** - validasi, database, dan response tercampur
- **Sulit di-maintain** - perubahan kecil bisa merusak bagian lain
- **Tidak bisa reuse** - query yang sama ditulis ulang di banyak tempat
- **Sulit dibagi ke tim** - tidak ada batas tanggung jawab yang jelas

**Solusi: MVC memisahkan tanggung jawab:**

| Layer | File | Tugasnya |
|-------|------|----------|
| **Model** | `Todo.js` | Hanya urusan database — query, insert, update, delete |
| **View** | *(tidak ada)* | Di API, view digantikan oleh JSON response |
| **Controller** | `todoController.js` | Terima request, panggil model, kirim response |
| **Routes** | `routes.js` | Tentukan endpoint mana → middleware mana → controller mana |

Perubahan query SQL? Cukup buka `Todo.js`. Perubahan validasi? Cukup buka `validateTodo.js`. Tidak ada yang saling mengganggu.

---

### 2. Alur Request dari Postman ke Database

Contoh: `POST /api/todos` dengan body `{ "title": "Belajar", "description": "..." }`

```
[ Postman ] POST http://localhost:3000/api/todos
     │
     ▼
[ index.js ]
  app.listen(PORT)                      ← server menerima koneksi
     │
     ▼
[ app.js ]
  (1) express.json()                    ← parse body JSON → req.body
  (2) app.use("/api/todos", todoRoutes) ← cocokkan prefix URL ke router
  (3) app.use(errorHandler)             ← dipasang paling akhir
     │
     ▼
[ routes.js ]
  POST "/" → validateCreateTodo → todoController.create
     │
     ▼
[ middleware/validateTodo.js ]
  (4) cek: title & description ada?
      ├── TIDAK → res.status(400).json(...)  ← berhenti di sini
      └── YA   → next()                     ← lanjut ke controller
                    │
                    ▼
[ controller/todoController.js ]
  (5) panggil Todo.create(req.body)
                    │
                    ▼
[ model/Todo.js ]
  (6) jalankan query SQL ke MySQL
                    │
                    ▼
[ MySQL Database ]
  INSERT → kembalikan data todo baru
                    │
                    ▼
[ controller/todoController.js ]
  (7) res.status(201).json({ success: true, data: todo })
                    │
                    ▼
[ Postman ] menerima response

```

**Kunci yang perlu dipahami:** setiap lapisan hanya melakukan satu hal. Request mengalir dari atas ke bawah, response balik dari bawah ke atas.

---

### 3. Middleware — Urutan dan Fungsinya

Middleware adalah fungsi yang berjalan **di antara** request masuk dan response keluar. Urutan pendaftarannya di `app.js` dan `routes.js` sangat menentukan perilaku aplikasi.

**Di `app.js`:**

```javascript
app.use(express.json());           // (1) — harus pertama, agar body bisa dibaca
app.use("/api/todos", todoRoutes); // (2) — routing
app.use(errorHandler);             // (3) — harus paling akhir
```

Kalau `express.json()` dipindah setelah routing, maka `req.body` akan selalu `undefined` saat controller membacanya.

Kalau `errorHandler` dipasang sebelum routing, error dari controller tidak akan pernah sampai ke sana.

**Di `routes.js`:**

```javascript
router.post("/", validateCreateTodo, todoController.create);
```

Urutan argumen setelah path adalah urutan eksekusi:

```
Request masuk
  → validateCreateTodo  (cek apakah input valid)
      → jika tidak valid: langsung res.status(400) — berhenti di sini
      → jika valid: next() — lanjut ke berikutnya
  → todoController.create  (proses dan simpan ke database)
```

**Tiga jenis middleware dalam proyek ini:**

| Middleware | Jenis | Fungsi |
|---|---|---|
| `express.json()` | Built-in Express | Parse request body dari JSON string ke object JS |
| `validateCreateTodo`, dll. | Custom (per-route) | Validasi input sebelum masuk controller |
| `errorHandler` | Custom (global) | Tangkap semua error yang di-pass via `next(err)` |

---

### 4. Referensi Fungsi vs Eksekusi Fungsi

Ini salah satu sumber bug yang sering muncul saat baru belajar Express.

**Eksekusi fungsi** — fungsi langsung dipanggil saat baris itu dibaca:

```javascript
router.get("/", todoController.getAll()); // SALAH
//                                    ^^
// getAll() dipanggil sekarang, bukan saat ada request
// yang diterima Express adalah return value-nya (undefined atau Promise)
// bukan fungsinya itu sendiri
```

**Referensi fungsi** — Express menyimpan fungsinya, lalu memanggil sendiri saat ada request masuk:

```javascript
router.get("/", todoController.getAll); // BENAR
//                               ^^^^
// tidak ada ()
// Express menerima fungsinya, dan akan memanggilnya
// dengan (req, res, next) ketika ada GET request ke "/"
```

Analogi: seperti memberikan nomor telepon ke seseorang vs langsung menelepon. Yang pertama, mereka bisa menelepon kapanpun dibutuhkan. Yang kedua, sambungan langsung terjadi saat itu.

Express memanggil setiap handler dengan signature: `function(req, res, next)`. Kalau kamu langsung eksekusi dengan `()`, Express tidak pernah mendapat fungsinya — hanya hasilnya.

---

### 5. next(err) dan Centralized Error Handler

**Masalah tanpa centralized error handler:**

```javascript
async getAll(req, res) {
  try {
    const todos = await Todo.getAll();
    res.json({ success: true, data: todos });
  } catch (err) {
    // setiap controller harus tulis sendiri
    res.status(500).json({ success: false, message: err.message });
  }
}
```

Kalau ada 10 controller method, kamu tulis logika error yang sama 10 kali. Dan kalau format error response perlu diubah, kamu harus ubah di 10 tempat.

**Solusinya: lempar error ke Express, tangkap di satu tempat.**

Di controller, cukup `next(err)`:

```javascript
async getAll(req, res, next) {
  try {
    const todos = await Todo.getAll();
    res.json({ success: true, data: todos });
  } catch (err) {
    next(err); // lempar ke error handler global
  }
}
```

Express mengenali error handler dari **4 parameter** (bukan 3). Ini konvensi Express:

```javascript
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
//                    ^^^
// parameter pertama adalah error object
// Express otomatis tahu ini adalah error handler

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });
}
```

Didaftarkan **paling akhir** di `app.js`:

```javascript
app.use(errorHandler); // setelah semua route
```

Dengan ini, format error response konsisten di seluruh aplikasi dan hanya perlu diubah di satu tempat.

---

### 6. PUT vs PATCH — Konvensi vs Implementasi

**Konvensi HTTP:**

| Method | Arti Semantik |
|--------|--------------|
| PUT    | Replace seluruh resource — kirim semua field, apapun yang tidak dikirim dianggap dihapus/null |
| PATCH  | Partial update — hanya kirim field yang ingin diubah |

**Implementasi di proyek ini:**

`PUT /:id` → `validateUpdateTodo` hanya mewajibkan `title`. Di model `Todo.update()`, `completed` punya default value `0` kalau tidak dikirim:

```javascript
static async update(id, { title, description, completed = 0 }) {
```

Ini artinya PUT di proyek ini tidak murni "replace" — kalau client tidak kirim `completed`, nilai di database akan di-reset ke `0`, bukan dipertahankan. Ini perilaku yang perlu disadari.

`PATCH /:id` → `validateTodoStatus` hanya mewajibkan `completed` (boolean). Di model `Todo.updateStatus()`, field yang tidak dikirim dipertahankan menggunakan nullish coalescing `??`:

```javascript
title ?? currentTodo.title,         // pakai nilai lama kalau title tidak dikirim
description ?? currentTodo.description,
completed ?? currentTodo.completed,
```

**Kenapa tidak langsung `UPDATE todos SET completed = ? WHERE id = ?`?**

Karena query di `updateStatus` memang menulis ulang semua kolom. Daripada menulis query berbeda untuk tiap field, ia ambil data saat ini dulu, lalu gabungkan dengan data baru yang masuk. Ini tradeoff: lebih mudah ditulis, tapi ada 1 query tambahan (SELECT dulu baru UPDATE).

---

### 7. Destructuring Parameter di Model

Di `Todo.js`, beberapa method menerima object sebagai parameter dan langsung di-destructure:

```javascript
static async create({ title, description }) {
  // langsung pakai title dan description
  // tidak perlu data.title atau data.description
}
```

Dibandingkan tanpa destructuring:

```javascript
static async create(data) {
  // harus tulis data.title dan data.description setiap kali
  await db.query("INSERT INTO todos (title, description) VALUES (?, ?)", [
    data.title,
    data.description,
  ]);
}
```

Destructuring membuat kode lebih ringkas dan langsung jelas field apa yang dibutuhkan hanya dari signature method-nya.

**Satu hal yang perlu diperhatikan:** di `Todo.update()`, ada default value sekaligus destructuring:

```javascript
static async update(id, { title, description, completed = 0 }) {
```

`completed = 0` artinya: kalau property `completed` tidak ada dalam object yang dikirim (atau nilainya `undefined`), gunakan `0` sebagai fallback. Ini cara JavaScript memberikan default value dalam destructuring.

Berbeda dengan `??` (nullish coalescing) yang dipakai di `updateStatus` — `??` hanya fallback ketika nilainya `null` atau `undefined`, sedangkan default value dalam destructuring (`= 0`) hanya aktif kalau nilainya `undefined` (bukan `null`).
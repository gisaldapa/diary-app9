import { db } from "../config/database.js";

const DEFAULT_MOOD = "😊";
const MIN_TITLE = 3;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function makePreview(body) {
  return body.trim().slice(0, 100);
}

// Mengembalikan pesan error (string) atau null jika valid.
// Hanya memvalidasi field yang dikirim (cocok untuk POST maupun PUT parsial).
function validateDiaryInput({ title, diary_date, body, mood }) {
  if (
    title !== undefined &&
    (typeof title !== "string" || title.trim().length < MIN_TITLE)
  ) {
    return `title minimal ${MIN_TITLE} karakter`;
  }
  if (body !== undefined && (typeof body !== "string" || body.trim() === "")) {
    return "body tidak boleh kosong";
  }
  if (diary_date !== undefined && !DATE_REGEX.test(diary_date)) {
    return "diary_date harus berformat YYYY-MM-DD";
  }
  if (mood !== undefined && (typeof mood !== "string" || mood.length > 20)) {
    return "mood maksimal 20 karakter";
  }
  return null;
}

// GET /api/diaries             -> semua diary
// GET /api/diaries?search=kata -> cari di title atau body
export async function getAllDiaries(req, res) {
  try {
    const search = String(req.query.search ?? "").trim();

    let sql = "SELECT * FROM diaries";
    const params = [];

    if (search) {
      // escape karakter wildcard LIKE agar dicari apa adanya
      const keyword = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
      sql += " WHERE title LIKE ? OR body LIKE ?";
      params.push(keyword, keyword);
    }

    sql += " ORDER BY created_at DESC, id DESC";

    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data diary",
    });
  }
}

export async function getDiaryById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await db.execute("SELECT * FROM diaries WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Diary tidak ditemukan",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil detail diary",
    });
  }
}

export async function createDiary(req, res) {
  try {
    const { title, diary_date, body, mood } = req.body ?? {};

    if (!title || !diary_date || !body) {
      return res.status(400).json({
        message: "title, diary_date, dan body wajib diisi",
      });
    }

    const invalid = validateDiaryInput({ title, diary_date, body, mood });
    if (invalid) {
      return res.status(400).json({ message: invalid });
    }

    const [result] = await db.execute(
      `INSERT INTO diaries
        (title, diary_date, preview, body, mood)
       VALUES (?, ?, ?, ?, ?)`,
      [
        title.trim(),
        diary_date,
        makePreview(body),
        body.trim(),
        mood && mood.trim() ? mood : DEFAULT_MOOD,
      ]
    );

    const [rows] = await db.execute("SELECT * FROM diaries WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal menambahkan diary",
    });
  }
}

export async function updateDiary(req, res) {
  try {
    const { id } = req.params;

    const [oldRows] = await db.execute("SELECT * FROM diaries WHERE id = ?", [
      id,
    ]);

    if (oldRows.length === 0) {
      return res.status(404).json({
        message: "Diary tidak ditemukan",
      });
    }

    const old = oldRows[0];
    const input = req.body ?? {};

    const invalid = validateDiaryInput(input);
    if (invalid) {
      return res.status(400).json({ message: invalid });
    }

    // Field yang tidak dikirim tetap memakai nilai lama (update parsial)
    const title = input.title !== undefined ? input.title.trim() : old.title;
    const diary_date =
      input.diary_date !== undefined ? input.diary_date : old.diary_date;
    const body = input.body !== undefined ? input.body.trim() : old.body;
    const mood =
      input.mood !== undefined && input.mood.trim() ? input.mood : old.mood;
    const liked = input.liked !== undefined ? (input.liked ? 1 : 0) : old.liked;

    await db.execute(
      `UPDATE diaries
       SET title = ?,
           diary_date = ?,
           preview = ?,
           body = ?,
           mood = ?,
           liked = ?
       WHERE id = ?`,
      [title, diary_date, makePreview(body), body, mood, liked, id]
    );

    const [rows] = await db.execute("SELECT * FROM diaries WHERE id = ?", [id]);

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal memperbarui diary",
    });
  }
}

export async function deleteDiary(req, res) {
  try {
    const { id } = req.params;

    const [result] = await db.execute("DELETE FROM diaries WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Diary tidak ditemukan",
      });
    }

    res.json({
      message: "Diary berhasil dihapus",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal menghapus diary",
    });
  }
}

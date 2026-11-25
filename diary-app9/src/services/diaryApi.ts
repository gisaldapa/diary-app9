export type DiaryEntry = {
  id: number;
  title: string;
  diary_date: string;
  preview: string | null;
  body: string;
  mood: string;
  liked: boolean;
  created_at: string;
  updated_at: string;
};

export type NewDiary = {
  title: string;
  diary_date: string;
  body: string;
  mood: string;
};

export type DiaryUpdate = Partial<NewDiary & { liked: boolean }>;

// MySQL BOOLEAN dikirim sebagai 0/1, jadi dinormalisasi ke boolean di sini.
type RawDiary = Omit<DiaryEntry, "liked"> & { liked: boolean | number };

const normalize = (row: RawDiary): DiaryEntry => ({
  ...row,
  liked: Boolean(row.liked),
});

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const TIMEOUT_MS = 10000;

function getBaseUrl() {
  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL belum diatur");
  }
  return API_URL.replace(/\/$/, "");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${getBaseUrl()}${path}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, { ...options, signal: controller.signal });
  } catch {
    throw new Error(
      "Tidak dapat terhubung ke server. Periksa Wi-Fi, alamat IP di .env, dan firewall (port 3000)."
    );
  } finally {
    clearTimeout(timer);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request gagal (${response.status})`);
  }

  return data as T;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

export async function apiGetDiaries(search?: string): Promise<DiaryEntry[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const rows = await request<RawDiary[]>(`/api/diaries${query}`);
  return rows.map(normalize);
}

export async function apiCreateDiary(data: NewDiary): Promise<DiaryEntry> {
  const row = await request<RawDiary>("/api/diaries", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  return normalize(row);
}

export async function apiUpdateDiary(
  id: number,
  data: DiaryUpdate
): Promise<DiaryEntry> {
  const row = await request<RawDiary>(`/api/diaries/${id}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(data),
  });
  return normalize(row);
}

export async function apiDeleteDiary(id: number): Promise<void> {
  await request<{ message: string }>(`/api/diaries/${id}`, {
    method: "DELETE",
  });
}

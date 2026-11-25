// Tanggal hari ini (zona waktu perangkat) dalam format YYYY-MM-DD.
// Tidak memakai toISOString() karena hasilnya UTC, sehingga di WIB
// (UTC+7) tanggal bisa mundur 1 hari pada dini hari.
export function todayLocal(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

import { useEffect, useRef, useState } from "react";
import { Alert, Text } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { editDiary } from "../../src/features/diary/diarySlice";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import DiaryForm from "../../src/components/DiaryForm";
import { SPACE } from "../../src/styles/tokens";

export default function EditScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();

  const saving = useAppSelector((state) => state.diary.saving);
  const entry = useAppSelector((state) =>
    state.diary.entries.find((item) => item.id === Number(id))
  );

  const [title, setTitle] = useState(entry?.title || "");
  const [body, setBody] = useState(entry?.body || "");
  const [mood, setMood] = useState(entry?.mood || "😊");

  // true bila ada perubahan yang belum disimpan
  const isDirty = entry
    ? title !== entry.title || body !== entry.body || mood !== entry.mood
    : false;

  // dipakai untuk melewati konfirmasi setelah simpan berhasil
  const skipGuard = useRef(false);

  // Konfirmasi saat user meninggalkan form yang belum disimpan
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!isDirty || skipGuard.current) return;

      e.preventDefault();

      Alert.alert(
        "Perubahan belum disimpan",
        "Jika keluar sekarang, perubahan akan hilang.",
        [
          { text: "Tetap di sini", style: "cancel" },
          {
            text: "Buang perubahan",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isDirty]);

  if (!entry) {
    return <Text style={{ padding: SPACE.l }}>Diary tidak ditemukan.</Text>;
  }

  const save = async () => {
    if (saving) return;

    if (title.trim().length < 3) {
      Alert.alert("Validasi", "Judul minimal 3 karakter");
      return;
    }
    if (!body.trim()) {
      Alert.alert("Validasi", "Isi diary wajib diisi");
      return;
    }

    try {
      await dispatch(
        editDiary({
          id: entry.id,
          data: { title: title.trim(), body: body.trim(), mood },
        })
      ).unwrap();

      skipGuard.current = true;
      router.back(); // kembali ke Detail yang sudah menampilkan data terbaru
    } catch (error) {
      Alert.alert(
        "Gagal memperbarui diary",
        error instanceof Error ? error.message : "Terjadi kesalahan"
      );
    }
  };

  return (
    <DiaryForm
      title={title}
      body={body}
      mood={mood}
      onChangeTitle={setTitle}
      onChangeBody={setBody}
      onChangeMood={setMood}
      onSubmit={save}
      submitLabel="Simpan Perubahan"
      saving={saving}
    />
  );
}

import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { addDiary } from "../../src/features/diary/diarySlice";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import DiaryForm from "../../src/components/DiaryForm";
import { todayLocal } from "../../src/utils/date";
import { COLORS, SPACE, TYPO } from "../../src/styles/tokens";

export default function CreateScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const saving = useAppSelector((state) => state.diary.saving);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState("😊");

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
        addDiary({
          title: title.trim(),
          diary_date: todayLocal(),
          body: body.trim(),
          mood,
        })
      ).unwrap();

      setTitle("");
      setBody("");
      setMood("😊");
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Diary gagal disimpan",
        error instanceof Error ? error.message : "Terjadi kesalahan"
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.heading}>Tambah Diary</Text>
      <DiaryForm
        title={title}
        body={body}
        mood={mood}
        onChangeTitle={setTitle}
        onChangeBody={setBody}
        onChangeMood={setMood}
        onSubmit={save}
        submitLabel="Simpan"
        saving={saving}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heading: {
    fontSize: TYPO.h1,
    fontWeight: "700",
    color: COLORS.text,
    paddingHorizontal: SPACE.l,
    paddingTop: SPACE.m,
  },
});

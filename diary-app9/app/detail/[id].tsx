import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { editDiary, removeDiary } from "../../src/features/diary/diarySlice";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import { COLORS, RADIUS, SPACE, TYPO } from "../../src/styles/tokens";

export default function DetailScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();

  const deleting = useAppSelector((state) => state.diary.deleting);
  const entry = useAppSelector((state) =>
    state.diary.entries.find((item) => item.id === Number(id))
  );

  if (!entry) {
    return <Text style={{ padding: SPACE.l }}>Diary tidak ditemukan.</Text>;
  }

  const toggleLike = async () => {
    try {
      await dispatch(
        editDiary({ id: entry.id, data: { liked: !entry.liked } })
      ).unwrap();
    } catch {
      Alert.alert("Error", "Gagal mengubah status favorite");
    }
  };

  const confirmDelete = () => {
    if (deleting) return;

    Alert.alert("Hapus Diary", "Data akan dihapus dari MySQL.", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(removeDiary(entry.id)).unwrap();
            router.replace("/");
          } catch {
            Alert.alert("Error", "Gagal menghapus diary");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.mood}>{entry.mood}</Text>
      <Text style={styles.title}>{entry.title}</Text>
      <Text style={styles.date}>{entry.diary_date}</Text>
      <Text style={styles.createdAt}>Dibuat: {entry.created_at}</Text>
      <Text style={styles.body}>{entry.body}</Text>

      <Pressable onPress={toggleLike} style={styles.like} disabled={deleting}>
        <Text style={styles.likeText}>
          {entry.liked ? "❤️ Hapus dari favorite" : "🤍 Tambah ke favorite"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() =>
          router.push({
            pathname: "/edit/[id]",
            params: { id: String(entry.id) },
          })
        }
        disabled={deleting}
        style={[styles.edit, deleting && styles.disabled]}
      >
        <Text style={styles.white}>Edit Diary</Text>
      </Pressable>

      <Pressable
        onPress={confirmDelete}
        disabled={deleting}
        style={[styles.delete, deleting && styles.disabled]}
      >
        {deleting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.white}>Hapus Diary</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACE.l, gap: SPACE.m },
  mood: { fontSize: 60 },
  title: { fontSize: TYPO.h1, fontWeight: "700", color: COLORS.text },
  date: { color: COLORS.muted },
  createdAt: { color: COLORS.muted, fontSize: TYPO.caption },
  body: { fontSize: 16, lineHeight: 24, color: COLORS.text },
  like: {
    padding: 14,
    alignItems: "center",
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  likeText: { color: COLORS.text, fontWeight: "600" },
  edit: {
    padding: 14,
    alignItems: "center",
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.accent,
  },
  delete: {
    padding: 14,
    alignItems: "center",
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.danger,
  },
  disabled: { opacity: 0.5 },
  white: { color: "#fff", fontWeight: "700" },
});

import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { editDiary, fetchDiaries } from "../../src/features/diary/diarySlice";
import {
  useAppDispatch,
  useAppSelector,
  useDebouncedValue,
} from "../../src/store/hooks";
import DiaryCard from "../../src/components/DiaryCard";
import type { DiaryEntry } from "../../src/services/diaryApi";
import { COLORS, RADIUS, SPACE, TYPO } from "../../src/styles/tokens";

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { entries, loading, error } = useAppSelector((state) => state.diary);

  const [search, setSearch] = useState("");
  const keyword = useDebouncedValue(search.trim(), 400);

  // Ambil data saat layar fokus dan setiap kata kunci (debounced) berubah.
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchDiaries(keyword));
    }, [dispatch, keyword])
  );

  const reload = () => dispatch(fetchDiaries(keyword));

  const toggleLike = async (entry: DiaryEntry) => {
    try {
      await dispatch(
        editDiary({ id: entry.id, data: { liked: !entry.liked } })
      ).unwrap();
    } catch {
      Alert.alert("Error", "Gagal mengubah status favorite");
    }
  };

  const renderBody = () => {
    if (loading && entries.length === 0) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.muted}>Mengambil diary...</Text>
        </View>
      );
    }

    if (error && entries.length === 0) {
      return (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.retry} onPress={reload}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.id)}
        refreshing={loading}
        onRefresh={reload}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <DiaryCard
            entry={item}
            onPress={() =>
              router.push({
                pathname: "/detail/[id]",
                params: { id: String(item.id) },
              })
            }
            onToggleLike={() => toggleLike(item)}
          />
        )}
        ListHeaderComponent={
          error ? <Text style={styles.errorBanner}>{error}</Text> : null
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {keyword
              ? `Tidak ada diary yang cocok dengan "${keyword}".`
              : "Belum ada diary. Tulis yang pertama di tab Tambah."}
          </Text>
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.heading}>Buku Harian</Text>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Cari judul atau isi diary..."
        style={styles.search}
        returnKeyType="search"
        autoCorrect={false}
      />
      {renderBody()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACE.l,
    backgroundColor: COLORS.background,
  },
  heading: {
    fontSize: TYPO.h1,
    fontWeight: "700",
    marginVertical: SPACE.m,
    color: COLORS.text,
  },
  search: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    padding: SPACE.m,
    marginBottom: SPACE.m,
    backgroundColor: COLORS.surface,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACE.m,
  },
  muted: { color: COLORS.muted },
  error: { color: COLORS.danger, textAlign: "center" },
  errorBanner: {
    color: COLORS.danger,
    marginBottom: SPACE.m,
    textAlign: "center",
  },
  retry: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.accent,
  },
  retryText: { color: "#fff", fontWeight: "700" },
  empty: { textAlign: "center", marginTop: 40, color: COLORS.muted },
});

import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { editDiary, fetchDiaries } from "../../src/features/diary/diarySlice";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import DiaryCard from "../../src/components/DiaryCard";
import type { DiaryEntry } from "../../src/services/diaryApi";
import { COLORS, SPACE, TYPO } from "../../src/styles/tokens";

export default function FavoritesScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { entries, loading, error } = useAppSelector((state) => state.diary);

  // Ambil ulang semua data (tanpa filter pencarian) setiap layar ini fokus.
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchDiaries());
    }, [dispatch])
  );

  // Hanya diary dengan liked = true
  const favorites = entries.filter((item) => item.liked);

  const toggleLike = async (entry: DiaryEntry) => {
    try {
      await dispatch(
        editDiary({ id: entry.id, data: { liked: !entry.liked } })
      ).unwrap();
    } catch {
      Alert.alert("Error", "Gagal mengubah status favorite");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.heading}>Favorite</Text>

      {loading && entries.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          refreshing={loading}
          onRefresh={() => dispatch(fetchDiaries())}
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
            error ? <Text style={styles.error}>{error}</Text> : null
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              Belum ada diary favorite. Ketuk ikon hati pada diary untuk
              menandainya.
            </Text>
          }
        />
      )}
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
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: COLORS.danger, textAlign: "center", marginBottom: SPACE.m },
  empty: { textAlign: "center", marginTop: 40, color: COLORS.muted },
});

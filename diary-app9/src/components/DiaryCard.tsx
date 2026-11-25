import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DiaryEntry } from "../services/diaryApi";
import { COLORS, RADIUS, SPACE, TYPO } from "../styles/tokens";

type Props = {
  entry: DiaryEntry;
  onPress: () => void;
  onToggleLike: () => void;
};

export default function DiaryCard({ entry, onPress, onToggleLike }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.mood}>{entry.mood}</Text>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {entry.title}
        </Text>
        <Text style={styles.date}>{entry.diary_date}</Text>
        <Text style={styles.preview} numberOfLines={2}>
          {entry.preview}
        </Text>
      </View>

      <Pressable onPress={onToggleLike} hitSlop={12}>
        <Text style={styles.heart}>{entry.liked ? "❤️" : "🤍"}</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.m,
    padding: 14,
    marginBottom: SPACE.m,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
  },
  mood: { fontSize: 32 },
  content: { flex: 1 },
  title: { fontSize: TYPO.title, fontWeight: "700", color: COLORS.text },
  date: { color: COLORS.muted, marginVertical: 4, fontSize: TYPO.caption },
  preview: { color: COLORS.text, fontSize: TYPO.body },
  heart: { fontSize: 22 },
});

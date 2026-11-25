import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACE } from "../styles/tokens";

export const MOODS = ["😊", "😌", "🤩", "😐", "😢", "😡"];

type Props = {
  value: string;
  onChange: (mood: string) => void;
};

export default function MoodPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {MOODS.map((mood) => {
        const active = mood === value;
        return (
          <Pressable
            key={mood}
            onPress={() => onChange(mood)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={styles.emoji}>{mood}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: SPACE.s },
  chip: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.chip,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentSoft,
  },
  emoji: { fontSize: 24 },
});

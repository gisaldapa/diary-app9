import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import MoodPicker from "./MoodPicker";
import { COLORS, RADIUS, SPACE, TYPO } from "../styles/tokens";

type Props = {
  title: string;
  body: string;
  mood: string;
  onChangeTitle: (v: string) => void;
  onChangeBody: (v: string) => void;
  onChangeMood: (v: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  saving: boolean;
};

// Form yang dipakai bersama oleh layar Tambah dan Edit.
export default function DiaryForm({
  title,
  body,
  mood,
  onChangeTitle,
  onChangeBody,
  onChangeMood,
  onSubmit,
  submitLabel,
  saving,
}: Props) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Judul</Text>
        <TextInput
          value={title}
          onChangeText={onChangeTitle}
          placeholder="Judul (minimal 3 karakter)"
          style={styles.input}
          editable={!saving}
          maxLength={150}
        />

        <Text style={styles.label}>Cerita</Text>
        <TextInput
          value={body}
          onChangeText={onChangeBody}
          placeholder="Ceritakan harimu..."
          multiline
          style={[styles.input, styles.bodyInput]}
          editable={!saving}
        />

        <Text style={styles.label}>Suasana hati</Text>
        <MoodPicker value={mood} onChange={onChangeMood} />

        <Pressable
          onPress={onSubmit}
          disabled={saving}
          style={[styles.button, saving && styles.buttonDisabled]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.white}>{submitLabel}</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: SPACE.l, gap: SPACE.m },
  label: { fontSize: TYPO.body, fontWeight: "600", color: COLORS.text },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    padding: SPACE.m,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  bodyInput: { minHeight: 140, textAlignVertical: "top" },
  button: {
    marginTop: SPACE.s,
    padding: 14,
    alignItems: "center",
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.accent,
  },
  buttonDisabled: { backgroundColor: COLORS.disabled },
  white: { color: "#fff", fontWeight: "700" },
});

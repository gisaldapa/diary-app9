import {
  createAsyncThunk,
  createSlice,
  isAnyOf,
} from "@reduxjs/toolkit";
import {
  apiCreateDiary,
  apiDeleteDiary,
  apiGetDiaries,
  apiUpdateDiary,
  DiaryEntry,
  DiaryUpdate,
  NewDiary,
} from "../../services/diaryApi";

type DiaryState = {
  entries: DiaryEntry[];
  loading: boolean; // sedang mengambil daftar diary
  saving: boolean; // sedang create / update
  deleting: boolean; // sedang delete
  error: string | null;
  currentRequestId?: string; // untuk mengabaikan response fetch yang sudah usang
};

const initialState: DiaryState = {
  entries: [],
  loading: false,
  saving: false,
  deleting: false,
  error: null,
};

export const fetchDiaries = createAsyncThunk(
  "diary/fetchDiaries",
  async (search?: string) => {
    return await apiGetDiaries(search);
  }
);

export const addDiary = createAsyncThunk(
  "diary/addDiary",
  async (data: NewDiary) => {
    return await apiCreateDiary(data);
  }
);

export const editDiary = createAsyncThunk(
  "diary/editDiary",
  async ({ id, data }: { id: number; data: DiaryUpdate }) => {
    return await apiUpdateDiary(id, data);
  }
);

export const removeDiary = createAsyncThunk(
  "diary/removeDiary",
  async (id: number) => {
    await apiDeleteDiary(id);
    return id;
  }
);

const diarySlice = createSlice({
  name: "diary",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ---------- READ ----------
      .addCase(fetchDiaries.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchDiaries.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.entries = action.payload;
        state.currentRequestId = undefined;
      })
      .addCase(fetchDiaries.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = action.error.message || "Gagal mengambil diary";
        state.currentRequestId = undefined;
      })
      // ---------- CREATE ----------
      .addCase(addDiary.fulfilled, (state, action) => {
        state.entries.unshift(action.payload);
      })
      // ---------- UPDATE ----------
      .addCase(editDiary.fulfilled, (state, action) => {
        const index = state.entries.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index >= 0) {
          state.entries[index] = action.payload;
        }
      })
      // ---------- DELETE ----------
      .addCase(removeDiary.pending, (state) => {
        state.deleting = true;
      })
      .addCase(removeDiary.fulfilled, (state, action) => {
        state.deleting = false;
        state.entries = state.entries.filter((item) => item.id !== action.payload);
      })
      .addCase(removeDiary.rejected, (state) => {
        state.deleting = false;
      })
      // ---------- flag saving (create & update) ----------
      .addMatcher(isAnyOf(addDiary.pending, editDiary.pending), (state) => {
        state.saving = true;
      })
      .addMatcher(
        isAnyOf(
          addDiary.fulfilled,
          addDiary.rejected,
          editDiary.fulfilled,
          editDiary.rejected
        ),
        (state) => {
          state.saving = false;
        }
      );
  },
});

export default diarySlice.reducer;

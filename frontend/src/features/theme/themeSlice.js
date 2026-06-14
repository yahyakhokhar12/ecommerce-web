import { createSlice } from '@reduxjs/toolkit';

const initial = localStorage.getItem('theme') || 'light';

if (initial === 'dark') document.documentElement.classList.add('dark');

const slice = createSlice({
  name: 'theme',
  initialState: { mode: initial },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.mode);
      document.documentElement.classList.toggle('dark');
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem('theme', state.mode);
      document.documentElement.classList.toggle('dark', state.mode === 'dark');
    },
  },
});

export const { toggleTheme, setTheme } = slice.actions;
export default slice.reducer;
export const selectTheme = (s) => s.theme.mode;

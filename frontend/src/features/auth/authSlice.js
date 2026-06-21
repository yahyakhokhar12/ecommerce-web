import { createSlice } from '@reduxjs/toolkit';

const readJson = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (_error) {
    localStorage.removeItem(key);
    return null;
  }
};

const initialState = {
  user: readJson('user'),
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      if (user) localStorage.setItem('user', JSON.stringify(user));
      if (accessToken) localStorage.setItem('accessToken', accessToken);
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentUser = (s) => s.auth.user;
export const selectIsAdmin = (s) => s.auth.user?.role === 'admin';

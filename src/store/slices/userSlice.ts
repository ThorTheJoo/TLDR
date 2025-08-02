import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserPreferences } from '../../types';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: undefined,
    preferences: {
      theme: 'auto',
      notifications: true,
      language: 'en',
    },
  },
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateUserPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      if (state.user) {
        state.user.preferences = { ...state.user.preferences, ...action.payload };
      }
    },
    clearUser: (state) => {
      state.user = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setUser,
  updateUserPreferences,
  clearUser,
  clearError,
} = userSlice.actions;

export default userSlice.reducer; 
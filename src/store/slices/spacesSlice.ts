import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Space } from '../../types';

interface SpacesState {
  spaces: Space[];
  activeSpace: Space | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SpacesState = {
  spaces: [
    {
      id: '1',
      name: 'Home',
      description: 'Personal and family communications',
      color: '#10B981',
      icon: 'home',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Work',
      description: 'Professional communications and tasks',
      color: '#3B82F6',
      icon: 'briefcase',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  activeSpace: null,
  isLoading: false,
  error: null,
};

const spacesSlice = createSlice({
  name: 'spaces',
  initialState,
  reducers: {
    setActiveSpace: (state, action: PayloadAction<Space | null>) => {
      state.activeSpace = action.payload;
    },
    addSpace: (state, action: PayloadAction<Space>) => {
      state.spaces.push(action.payload);
    },
    updateSpace: (state, action: PayloadAction<Space>) => {
      const index = state.spaces.findIndex(space => space.id === action.payload.id);
      if (index !== -1) {
        state.spaces[index] = action.payload;
      }
    },
    deleteSpace: (state, action: PayloadAction<string>) => {
      state.spaces = state.spaces.filter(space => space.id !== action.payload);
      if (state.activeSpace?.id === action.payload) {
        state.activeSpace = null;
      }
    },
    toggleSpace: (state, action: PayloadAction<string>) => {
      const space = state.spaces.find(s => s.id === action.payload);
      if (space) {
        space.isActive = !space.isActive;
        space.updatedAt = new Date();
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setActiveSpace,
  addSpace,
  updateSpace,
  deleteSpace,
  toggleSpace,
  clearError,
} = spacesSlice.actions;

export default spacesSlice.reducer; 
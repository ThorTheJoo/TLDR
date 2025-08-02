import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Insight } from '../../types';

interface InsightsState {
  insights: Insight[];
  isLoading: boolean;
  error: string | null;
}

const initialState: InsightsState = {
  insights: [
    {
      id: '1',
      type: 'reminder',
      title: 'Invoice Payment Due',
      description: 'Invoice #12345 is due in 3 days',
      priority: 'high',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      spaceId: '2',
      tags: ['invoice', 'payment'],
      source: 'whatsapp',
      isCompleted: false,
      createdAt: new Date(),
    },
    {
      id: '2',
      type: 'task',
      title: 'Schedule Meeting',
      description: 'Follow up on project discussion from yesterday',
      priority: 'medium',
      spaceId: '2',
      tags: ['meeting', 'follow-up'],
      source: 'whatsapp',
      isCompleted: false,
      createdAt: new Date(),
    },
    {
      id: '3',
      type: 'event',
      title: 'School Event',
      description: 'PTA meeting tomorrow at 6 PM',
      priority: 'medium',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      spaceId: '1',
      tags: ['school', 'pta'],
      source: 'whatsapp',
      isCompleted: false,
      createdAt: new Date(),
    },
  ],
  isLoading: false,
  error: null,
};

const insightsSlice = createSlice({
  name: 'insights',
  initialState,
  reducers: {
    addInsight: (state, action: PayloadAction<Insight>) => {
      state.insights.unshift(action.payload);
    },
    updateInsight: (state, action: PayloadAction<Insight>) => {
      const index = state.insights.findIndex(insight => insight.id === action.payload.id);
      if (index !== -1) {
        state.insights[index] = action.payload;
      }
    },
    deleteInsight: (state, action: PayloadAction<string>) => {
      state.insights = state.insights.filter(insight => insight.id !== action.payload);
    },
    toggleInsightCompletion: (state, action: PayloadAction<string>) => {
      const insight = state.insights.find(i => i.id === action.payload);
      if (insight) {
        insight.isCompleted = !insight.isCompleted;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addInsight,
  updateInsight,
  deleteInsight,
  toggleInsightCompletion,
  clearError,
} = insightsSlice.actions;

export default insightsSlice.reducer; 
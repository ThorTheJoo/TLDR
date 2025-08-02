import { configureStore } from '@reduxjs/toolkit';
import whatsappReducer from './slices/whatsappSlice';
import messagesReducer from './slices/messagesSlice';
import spacesReducer from './slices/spacesSlice';
import insightsReducer from './slices/insightsSlice';
import userReducer from './slices/userSlice';
import integrationsReducer from './slices/integrationsSlice';

export const store = configureStore({
  reducer: {
    whatsapp: whatsappReducer,
    messages: messagesReducer,
    spaces: spacesReducer,
    insights: insightsReducer,
    user: userReducer,
    integrations: integrationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
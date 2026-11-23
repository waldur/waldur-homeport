import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { bootstrapMicroApp } from 'waldur-shell';
import { createTablesStore } from 'waldur-table';

import { App } from './App';
import { ROOT_APP_URL } from './links';
import { QUERY_KEY } from './queries';
import './tailwind.css';
import 'waldur-design-tokens/fonts.css';

bootstrapMicroApp({
  // Every page needs a signed-in user: someone signed out goes to sign-in.
  requireSession: true,
  // Back to the same page after logging in, not the portal's front page.
  onSessionExpired: () => {
    const next = encodeURIComponent(window.location.href);
    window.location.href = `${ROOT_APP_URL.replace(/\/$/, '')}/login/?next=${next}`;
  },
});

const queryClient: QueryClient = new QueryClient({
  // A key command changes the key list: refetch this app's queries and the
  // tables' own pages.
  mutationCache: new MutationCache({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['table'] });
    },
  }),
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 30_000 },
  },
});

// The tables keep their page and sorting in a Redux store.
const tablesStore = createTablesStore();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={tablesStore}>
        <App />
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>,
);

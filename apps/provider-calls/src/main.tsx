import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { bootstrapMicroApp } from 'waldur-shell';

import { App } from './App';
import { ROOT_APP_URL } from './links';
import { PROVIDER_CALLS_QUERY_KEY } from './queries';
import './tailwind.css';
import 'waldur-design-tokens/fonts.css';

bootstrapMicroApp({
  // Back to the same page after logging in, not the portal's front page.
  onSessionExpired: () => {
    const next = encodeURIComponent(window.location.href);
    window.location.href = `${ROOT_APP_URL.replace(/\/$/, '')}/login/?next=${next}`;
  },
});

const queryClient: QueryClient = new QueryClient({
  // Any answer given here (a request, an award, an assessment from the
  // shared proposal package, which knows nothing of this app's queries)
  // changes the inbox counts and task lists, so they are fetched again.
  mutationCache: new MutationCache({
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [PROVIDER_CALLS_QUERY_KEY] }),
  }),
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 30_000 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);

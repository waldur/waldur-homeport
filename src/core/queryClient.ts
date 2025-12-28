import { QueryCache, QueryClient } from '@tanstack/react-query';

import { router } from '@waldur/router';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      // Don't redirect for "Invalid page" errors - tables handle this by resetting pagination
      // SDK throws error body directly: { detail: "Invalid page." }
      // Axios-style errors have: error.response.data.detail
      const detail = error?.detail || error?.response?.data?.detail;
      if (detail === 'Invalid page.') {
        return;
      }
      if (error?.response?.status == 404) {
        router.stateService.go('errorPage.notFound');
      }
    },
  }),
});

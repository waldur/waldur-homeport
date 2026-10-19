import { vi } from 'vitest';

const mockNotifyActions = {
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn(),
  showRedirectMessage: vi.fn(),
  showErrorResponse: vi.fn(),
};
const mockUseNotify = vi.fn(() => mockNotifyActions);
const mockNotifyService = {
  success: mockNotifyActions.showSuccess,
  error: mockNotifyActions.showError,
  info: mockNotifyActions.showInfo,
  warning: mockNotifyActions.showRedirectMessage,
  errorResponse: mockNotifyActions.showErrorResponse,
};

vi.mock('@/store/notify', () => ({
  useNotify: mockUseNotify,
  NotifyService: mockNotifyService,
}));

// The same mocks for code that takes useNotify from waldur-notifications
// itself (the shell's useManagedMutation and useBatchMutation).
vi.mock('waldur-notifications', async (importOriginal) => ({
  ...(await importOriginal()),
  useNotify: mockUseNotify,
  NotifyService: mockNotifyService,
}));

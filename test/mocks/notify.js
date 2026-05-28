import { vi } from 'vitest';

const mockNotifyActions = {
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn(),
  showRedirectMessage: vi.fn(),
  showErrorResponse: vi.fn(),
};

vi.mock('@/store/notify', () => ({
  useNotify: vi.fn(() => mockNotifyActions),
  NotifyService: {
    success: mockNotifyActions.showSuccess,
    error: mockNotifyActions.showError,
    info: mockNotifyActions.showInfo,
    warning: mockNotifyActions.showRedirectMessage,
    errorResponse: mockNotifyActions.showErrorResponse,
  },
}));

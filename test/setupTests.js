import '@testing-library/jest-dom/vitest';
import 'vitest-location-mock';
import { vi } from 'vitest';

const mockModalActions = {
  openDialog: vi.fn(),
  closeDialog: vi.fn(),
  confirm: vi.fn().mockResolvedValue(undefined),
  modalComponent: null,
  modalProps: {},
  confirmComponent: null,
  confirmProps: {},
};

vi.mock('@/modal/actions', () => ({
  useModal: vi.fn(() => mockModalActions),
  ModalService: {
    open: mockModalActions.openDialog,
    close: mockModalActions.closeDialog,
    confirm: mockModalActions.confirm,
  },
}));

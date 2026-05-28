import { vi } from 'vitest';

vi.mock('waldur-js-client');
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

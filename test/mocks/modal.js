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
const mockUseModal = vi.fn(() => mockModalActions);
const mockModalService = {
  open: mockModalActions.openDialog,
  close: mockModalActions.closeDialog,
  confirm: mockModalActions.confirm,
};

vi.mock('@/modal/actions', () => ({
  useModal: mockUseModal,
  ModalService: mockModalService,
}));

// The same mocks inside waldur-ui, where useModal and ModalService now live:
// the shell's useManagedMutation and waldur-ui's own CloseDialogButton and
// confirmation dialogs take them from here (the waldur-ui barrel re-exports
// it). A test that renders a real ModalProvider unmocks both this and
// @/modal/actions.
vi.mock(
  '../../packages/ui/src/Dialog/modalContext',
  async (importOriginal) => ({
    ...(await importOriginal()),
    useModal: mockUseModal,
    ModalService: mockModalService,
  }),
);

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { Call } from '@/proposals/types';

const CallRoundCreateDialog = lazyComponent(() =>
  import('./CallRoundCreateDialog').then((module) => ({
    default: module.CallRoundCreateDialog,
  })),
);

interface RoundCreateButtonProps {
  call: Call;
  refetch(): void;
}

export const RoundCreateButton = ({
  call,
  refetch,
}: RoundCreateButtonProps) => (
  <CreateModalButton
    dialog={CallRoundCreateDialog}
    resolve={{ call, refetch }}
    size="md"
    dialogClassName="modal-md modal-dialog-centered"
    formId="CallRoundForm"
  />
);

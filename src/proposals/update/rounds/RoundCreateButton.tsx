import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { Call } from '@waldur/proposals/types';

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
    size="lg"
  />
);

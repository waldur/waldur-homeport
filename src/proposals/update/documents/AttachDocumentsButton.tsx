import { PlusCircleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const AttachDocumentsDialog = lazyComponent(() =>
  import('./AttachDocumentsDialog').then((module) => ({
    default: module.AttachDocumentsDialog,
  })),
);

export const AttachDocumentsButton = ({
  call,
  refetch,
  disabled,
  tooltip,
}: {
  call: any;
  refetch(): void;
  disabled?: boolean;
  tooltip?: string;
}) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(AttachDocumentsDialog, {
      resolve: { call, refetch },
      formId: 'AttachDocumentsDialog',
    });
  };
  return (
    <ActionButton
      action={callback}
      title={translate('Add document')}
      iconNode={<PlusCircleIcon weight="bold" />}
      disabled={disabled}
      tooltip={tooltip}
    />
  );
};

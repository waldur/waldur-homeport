import { PlusCircleIcon } from '@phosphor-icons/react';
import { Offering } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const AddDocumentDialog = lazyComponent(() =>
  import('./AddDocumentDialog').then((module) => ({
    default: module.AddDocumentDialog,
  })),
);

export const AddDocumentButton = ({
  offering,
  refetch,
  disabled,
  tooltip,
}: {
  offering: Offering;
  refetch(): void;
  disabled?: boolean;
  tooltip?: string;
}) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(AddDocumentDialog, {
      resolve: { offering, refetch },
      formId: 'AddDocumentDialog',
    });
  };
  return (
    <BaseButton
      onClick={callback}
      label={translate('Add document')}
      iconNode={<PlusCircleIcon weight="bold" />}
      disabled={disabled}
      tooltip={tooltip}
      variant="tertiary"
      size="lg"
    />
  );
};

import { PlusCircleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { ActionButton } from '@waldur/table/ActionButton';

import { AccessSubnetFormProps } from './AccessSubnetForm';

const AccessSubnetForm = lazyComponent(() =>
  import('./AccessSubnetForm').then((module) => ({
    default: module.AccessSubnetForm,
  })),
);

export const AccessSubnetCreateButton = ({
  refetch,
  customer_url,
}: AccessSubnetFormProps) => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      title={translate('Add access subnet')}
      action={() =>
        openDialog(AccessSubnetForm, {
          refetch,
          customer_url,
          size: 'lg',
        })
      }
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  );
};

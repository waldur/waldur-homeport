import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { useModal } from '@waldur/modal/hooks';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

const CustomerCreateDialog = lazyComponent(() =>
  import('@waldur/customer/create/CustomerCreateDialog').then((module) => ({
    default: module.CustomerCreateDialog,
  })),
);

export const OrganizationCreateButton: FunctionComponent = () => {
  const user = useSelector(getUser);
  const { openDialog } = useModal();

  const handleClick = () => {
    openDialog(CustomerCreateDialog, {
      resolve: { role: 'CUSTOMER' },
    });
  };

  return user.is_staff ? (
    <ActionButton
      title={translate('Add')}
      action={handleClick}
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="primary"
    />
  ) : null;
};

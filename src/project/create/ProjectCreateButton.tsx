import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { ButtonVariant } from 'react-bootstrap/esm/types';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n/translate';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionButton } from '@/table/ActionButton';
import { useUser, useCustomer } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

const ProjectCreateDialog = lazyComponent(() =>
  import('./ProjectCreateDialog').then((module) => ({
    default: module.ProjectCreateDialog,
  })),
);

interface ProjectCreateButtonProps {
  customer: Customer;
  variant?: ButtonVariant;
  title?: string;
  iconNode?: ReactNode;
  refetch?: () => void;
  className?: string;
}

export const ProjectCreateButton: FC<ProjectCreateButtonProps> = ({
  customer: _customer,
  title = translate('Add'),
  variant = 'primary',
  iconNode,
  refetch,
  className,
}) => {
  const currentCustomer = useCustomer();
  const customer = _customer || currentCustomer;
  const user = useUser();
  const disabled =
    !customer ||
    !hasPermission(user, {
      permission: PermissionEnum.CREATE_PROJECT,
      customerId: customer.uuid,
    });
  const { openDialog } = useModal();

  return (
    <ActionButton
      title={title}
      variant={variant}
      className={className}
      action={() =>
        openDialog(ProjectCreateDialog, {
          size: 'lg',
          formId: 'projectCreate',
          customer,
          refetch,
        })
      }
      tooltip={
        !customer
          ? translate('There is no active organization')
          : disabled
            ? translate(
                "You don't have enough privileges to perform this operation.",
              )
            : undefined
      }
      iconNode={iconNode || <PlusCircleIcon weight="bold" />}
      disabled={disabled}
    />
  );
};

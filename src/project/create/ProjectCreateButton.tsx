import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { ButtonVariant } from 'react-bootstrap/esm/types';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, getUser } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

const ProjectCreateDialog = lazyComponent(() =>
  import('./ProjectCreateDialog').then((module) => ({
    default: module.ProjectCreateDialog,
  })),
);

interface ProjectCreateButtonProps {
  customer: Customer;
  variant?: ButtonVariant;
  size?: 'sm' | 'lg';
  title?: string;
  iconNode?: ReactNode;
  refetch?;
  className?: string;
}

export const ProjectCreateButton: FC<ProjectCreateButtonProps> = ({
  customer: _customer,
  title = translate('Add'),
  variant = 'primary',
  iconNode,
  size,
  refetch,
  className,
}) => {
  const currentCustomer = useSelector(getCustomer);
  const customer = _customer || currentCustomer;
  const user = useSelector(getUser);
  const disabled =
    !customer ||
    !hasPermission(user, {
      permission: PermissionEnum.CREATE_PROJECT,
      customerId: customer.uuid,
    });
  const dispatch = useDispatch();

  return (
    <ActionButton
      title={title}
      size={size}
      variant={variant}
      className={className}
      action={() =>
        dispatch(
          openModalDialog(ProjectCreateDialog, {
            size: 'lg',
            formId: 'projectCreate',
            customer,
            refetch,
          }),
        )
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

import { CheckIcon, ProhibitIcon, SpinnerIcon } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { User, usersPartialUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

export const UserBulkActions = ({
  rows,
  refetch,
}: {
  rows: User[];
  refetch: () => void;
}) => {
  const inactiveUsers = rows.filter((user) => !user.is_active);
  const activeUsers = rows.filter((user) => user.is_active);

  const { mutate: activate, isPending: isActivating } = useBatchMutation<
    User,
    void
  >({
    rows: inactiveUsers,
    refetch,
    mutationFn: (user) =>
      usersPartialUpdate({
        path: { uuid: user.uuid },
        body: { is_active: true },
      }),
    successMessage: translate('{count} user(s) have been activated.', {
      count: inactiveUsers.length,
    }),
    renderPartialSuccessMessage: (n) =>
      translate('{n} user(s) have been activated.', { n }),
    errorMessage: translate('Unable to activate users.'),
    renderErrorMessage: (n) =>
      translate('Unable to activate {n} users.', { n }),
  });

  const { mutate: deactivate, isPending: isDeactivating } = useBatchMutation<
    User,
    void
  >({
    rows: activeUsers,
    refetch,
    mutationFn: (user) =>
      usersPartialUpdate({
        path: { uuid: user.uuid },
        body: { is_active: false },
      }),
    successMessage: translate('{count} user(s) have been deactivated.', {
      count: activeUsers.length,
    }),
    renderPartialSuccessMessage: (n) =>
      translate('{n} user(s) have been deactivated.', { n }),
    errorMessage: translate('Unable to deactivate users.'),
    renderErrorMessage: (n) =>
      translate('Unable to deactivate {n} users.', { n }),
  });

  const isLoading = isActivating || isDeactivating;

  return (
    <ActionsDropdownComponent labeled drop="down">
      <Dropdown.Item
        onClick={() => activate()}
        disabled={isLoading || inactiveUsers.length === 0}
      >
        {isActivating ? (
          <SpinnerIcon
            size={20}
            className="animation-spin me-2"
            weight="bold"
          />
        ) : (
          <CheckIcon size={20} className="me-2" weight="bold" />
        )}
        {translate('Activate')}
      </Dropdown.Item>
      <Dropdown.Item
        onClick={() => deactivate()}
        disabled={isLoading || activeUsers.length === 0}
      >
        {isDeactivating ? (
          <SpinnerIcon
            size={20}
            className="animation-spin me-2"
            weight="bold"
          />
        ) : (
          <ProhibitIcon size={20} className="me-2" weight="bold" />
        )}
        {translate('Deactivate')}
      </Dropdown.Item>
    </ActionsDropdownComponent>
  );
};

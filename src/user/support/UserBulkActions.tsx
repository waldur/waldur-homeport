import {
  CheckIcon,
  ProhibitIcon,
  QuestionIcon,
  SpinnerIcon,
} from '@phosphor-icons/react';
import { User, usersPartialUpdate } from 'waldur-js-client';

import { Menu, Tooltip } from 'waldur-ui';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { ActionsMenu } from '@/table/ActionsDropdown';

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
    <ActionsMenu toggle="labeled" side="bottom">
      <Menu.Item
        icon={
          isActivating ? (
            <SpinnerIcon className="animation-spin" weight="bold" />
          ) : (
            <CheckIcon weight="bold" />
          )
        }
        trailing={
          inactiveUsers.length === 0 ? (
            <Tooltip
              label={translate('None of the selected users are inactive.')}
            >
              <QuestionIcon
                size={16}
                weight="bold"
                className="text-[var(--menu-item-muted-text)]"
              />
            </Tooltip>
          ) : undefined
        }
        onSelect={() => activate()}
        disabled={isLoading || inactiveUsers.length === 0}
      >
        {translate('Activate')}
      </Menu.Item>
      <Menu.Item
        icon={
          isDeactivating ? (
            <SpinnerIcon className="animation-spin" weight="bold" />
          ) : (
            <ProhibitIcon weight="bold" />
          )
        }
        trailing={
          activeUsers.length === 0 ? (
            <Tooltip
              label={translate('None of the selected users are active.')}
            >
              <QuestionIcon
                size={16}
                weight="bold"
                className="text-[var(--menu-item-muted-text)]"
              />
            </Tooltip>
          ) : undefined
        }
        onSelect={() => deactivate()}
        disabled={isLoading || activeUsers.length === 0}
      >
        {translate('Deactivate')}
      </Menu.Item>
    </ActionsMenu>
  );
};

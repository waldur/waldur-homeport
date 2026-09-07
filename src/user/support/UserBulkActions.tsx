import {
  CheckIcon,
  ProhibitIcon,
  QuestionIcon,
  SpinnerIcon,
} from '@phosphor-icons/react';
import { User, usersPartialUpdate } from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import {
  ActionsDropdownComponent,
  ActionsDropdownItem,
} from '@/table/ActionsDropdown';

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
      <div className="d-flex align-items-center">
        <ActionsDropdownItem
          className="flex-grow-1"
          onSelect={() => activate()}
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
        </ActionsDropdownItem>
        {/* A disabled ActionsDropdownItem gets pointer-events: none, so the
            tooltip has to sit on a separate, non-disabled sibling rather
            than wrap the item itself -- same trick ActionItem.tsx uses. */}
        {inactiveUsers.length === 0 && (
          <Tip
            label={translate('None of the selected users are inactive.')}
            id="user-bulk-activate-reason"
            className="ms-1 me-3"
          >
            <QuestionIcon size={16} weight="bold" className="text-muted" />
          </Tip>
        )}
      </div>
      <div className="d-flex align-items-center">
        <ActionsDropdownItem
          className="flex-grow-1"
          onSelect={() => deactivate()}
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
        </ActionsDropdownItem>
        {activeUsers.length === 0 && (
          <Tip
            label={translate('None of the selected users are active.')}
            id="user-bulk-deactivate-reason"
            className="ms-1 me-3"
          >
            <QuestionIcon size={16} weight="bold" className="text-muted" />
          </Tip>
        )}
      </div>
    </ActionsDropdownComponent>
  );
};

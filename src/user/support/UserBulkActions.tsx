import { CheckIcon, ProhibitIcon, SpinnerIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { User, usersPartialUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

export const UserBulkActions = ({
  rows,
  refetch,
}: {
  rows: User[];
  refetch: () => void;
}) => {
  const dispatch = useDispatch();

  const inactiveUsers = rows.filter((user) => !user.is_active);
  const activeUsers = rows.filter((user) => user.is_active);

  const { mutate: activate, isPending: isActivating } = useMutation({
    mutationFn: async () => {
      await Promise.all(
        inactiveUsers.map((user) =>
          usersPartialUpdate({
            path: { uuid: user.uuid },
            body: { is_active: true },
          }),
        ),
      );
    },
    onSuccess: () => {
      refetch();
      dispatch(
        showSuccess(
          translate('{count} user(s) have been activated.', {
            count: inactiveUsers.length,
          }),
        ),
      );
    },
    onError: (error) => {
      dispatch(
        showErrorResponse(error, translate('Unable to activate users.')),
      );
    },
  });

  const { mutate: deactivate, isPending: isDeactivating } = useMutation({
    mutationFn: async () => {
      await Promise.all(
        activeUsers.map((user) =>
          usersPartialUpdate({
            path: { uuid: user.uuid },
            body: { is_active: false },
          }),
        ),
      );
    },
    onSuccess: () => {
      refetch();
      dispatch(
        showSuccess(
          translate('{count} user(s) have been deactivated.', {
            count: activeUsers.length,
          }),
        ),
      );
    },
    onError: (error) => {
      dispatch(
        showErrorResponse(error, translate('Unable to deactivate users.')),
      );
    },
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

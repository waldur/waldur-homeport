import { useQuery } from '@tanstack/react-query';
import { FC, PropsWithChildren, useCallback } from 'react';

import { BaseButton, Menu } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { ActionList } from './ActionList';
import { loadData } from './loadData';
import { ModalActionsDialog } from './ModalActionsDialog';

const ModalMessage: FC<PropsWithChildren> = ({ children }) => (
  <div className="justify-content-center mx-5 my-5">
    <div className="mx-auto">{children}</div>
  </div>
);

export const ActionsPopover = ({
  url,
  name,
  refetch: refetchParent,
  ActionsList,
}) => {
  const {
    isLoading: loading,
    error,
    data: value,
    refetch: refetchChild,
  } = useQuery({
    queryKey: ['ActionsPopover', url],
    queryFn: () => loadData(url),
  });
  const refetch = useCallback(
    () => Promise.all([refetchParent(), refetchChild()]),
    [refetchParent, refetchChild],
  );
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(ModalActionsDialog, {
      name,
      refetch,
      ActionsList,
      className: 'resource-actions-modal',
      // The dialog's accessible name (ModalShell's hidden Dialog.Title):
      // named for the resource rather than by the visible title, which also
      // holds the state badge and is only the badge for a resource with no
      // name.
      title: name
        ? translate('Actions for {name}', { name })
        : translate('Resource actions'),
      ...value,
    });
  };

  return loading ? (
    <ModalMessage>
      <LoadingSpinner />
      <div className="text-center">{translate('Loading actions')}</div>
    </ModalMessage>
  ) : error ? (
    <ModalMessage>
      <div className="text-center">{translate('Unable to load actions')}</div>
    </ModalMessage>
  ) : value ? (
    <>
      <ActionList hideGroupName hideNonImportant>
        <ActionsList {...value} refetch={refetch} />
      </ActionList>
      {/* A button, not an action row: it opens a dialog rather than doing
          anything to the resource. Deliberately outside Menu.Item — a row
          overrides a nested button's own colour and hover, so inside one it
          stops looking like a button at all. Same shape as the generic menu's
          in ResourceActionComponent. */}
      <Menu.Separator />
      <div className="flex justify-center p-1">
        <BaseButton
          variant="text-secondary"
          size="sm"
          label={translate('Show all')}
          onClick={callback}
        />
      </div>
    </>
  ) : null;
};

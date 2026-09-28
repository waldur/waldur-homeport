import { useQuery } from '@tanstack/react-query';
import { FC, PropsWithChildren, useCallback, useMemo } from 'react';

import { BaseButton } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { loadData } from './loadData';
import { ModalActionsDialog } from './ModalActionsDialog';
import {
  ResourceActionMenuContext,
  ResourceActionMenuContextModel,
} from './ResourceActionMenuContext';

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
  const actionMenuContextValue = useMemo<ResourceActionMenuContextModel>(
    () => ({
      hideDisabled: false,
      query: '',
      hideGroupName: true,
      hideNonImportant: true,
    }),
    [],
  );
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
      <ResourceActionMenuContext.Provider value={actionMenuContextValue}>
        <ActionsList {...value} refetch={refetch} />
      </ResourceActionMenuContext.Provider>
      <div className="d-flex flex-column justify-content-center flex-grow-1">
        <BaseButton
          variant="text-primary"
          className="text-decoration-underline my-1"
          onClick={callback}
          label={translate('Show all')}
          size="sm"
        />
      </div>
    </>
  ) : null;
};

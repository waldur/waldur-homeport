import { FC, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { loadData } from './loadData';
import { ModalActionsDialog } from './ModalActionsDialog';
import {
  ResourceActionMenuContext,
  ResourceActionMenuContextModel,
} from './ResourceActionMenuContext';

const ModalMessage: FC<{}> = ({ children }) => (
  <div className="justify-content-center mx-5 my-5">
    <div className="mx-auto">{children}</div>
  </div>
);

export const ActionsPopover = ({ url, name, refetch, ActionsList }) => {
  const { loading, error, value } = useAsync(() => loadData(url), [url]);
  const actionMenuContextValue = useMemo<ResourceActionMenuContextModel>(
    () => ({
      hideDisabled: false,
      query: '',
      hideGroupName: true,
      hideNonImportant: true,
    }),
    [],
  );
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(ModalActionsDialog, {
        name,
        refetch,
        ActionsList,
        ...value,
      }),
    );
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
        <Button
          variant="link"
          size="sm"
          className="text-decoration-underline my-1"
          role="button"
          onClick={callback}
        >
          {translate('Show all')}
        </Button>
      </div>
    </>
  ) : null;
};

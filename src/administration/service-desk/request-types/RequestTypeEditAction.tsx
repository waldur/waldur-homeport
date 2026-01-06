import { PencilSimple } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { RequestTypeAdmin } from './api';

const RequestTypeFormDialog = lazyComponent(() =>
  import('./RequestTypeForm').then((module) => ({
    default: module.RequestTypeForm,
  })),
);

export const RequestTypeEditAction = ({
  row,
  refetch,
}: {
  row: RequestTypeAdmin;
  refetch: () => void;
}) => {
  const dispatch = useDispatch();
  return (
    <ActionItem
      title={translate('Edit')}
      iconNode={<PencilSimple />}
      action={() =>
        dispatch(
          openModalDialog(RequestTypeFormDialog, {
            size: 'lg',
            resolve: { requestType: row, refetch },
          }),
        )
      }
    />
  );
};

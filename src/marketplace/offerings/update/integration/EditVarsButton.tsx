import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { RowEditButton } from '../RowEditButton';

import { ENVIRON_FORM_ID } from './constants';

const EditVarsDialog = lazyComponent(
  () => import('./EditVarsDialog'),
  'EditVarsDialog',
);

export const EditVarsButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditVarsDialog, {
        resolve: { offering, refetch },
        size: 'lg',
        formId: ENVIRON_FORM_ID,
      }),
    );
  };
  return (
    <RowEditButton
      onClick={callback}
      title={translate('Edit environment variables')}
      variant="light"
      className="me-3"
    />
  );
};

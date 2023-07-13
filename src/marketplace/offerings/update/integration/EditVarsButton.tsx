import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

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
    <Button onClick={callback} size="sm" variant="light" className="me-3">
      <i className="fa fa-pencil"></i> {translate('Edit environment variables')}
    </Button>
  );
};

import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { EDIT_SCRIPT_FORM_ID } from './constants';

const EditScriptDialog = lazyComponent(
  () => import('./EditScriptDialog'),
  'EditScriptDialog',
);

export const EditScriptButton: FunctionComponent<{
  offering;
  type;
  label;
  refetch;
}> = (props) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditScriptDialog, {
        resolve: props,
        formId: EDIT_SCRIPT_FORM_ID,
        size: props.type !== 'language' && 'xl',
      }),
    );
  };
  return (
    <Button onClick={callback} size="sm" className="me-3">
      <i className="fa fa-pencil" /> {translate('Edit')}
    </Button>
  );
};

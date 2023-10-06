import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { GETTING_STARTED_FORM_ID } from './constants';

const EditGettingStartedDialog = lazyComponent(
  () => import('./EditGettingStartedDialog'),
  'EditGettingStartedDialog',
);

export const EditGettingStartedButton: FC<{ offering; refetch }> = (props) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditGettingStartedDialog, {
        resolve: props,
        formId: GETTING_STARTED_FORM_ID,
        size: 'lg',
      }),
    );
  };
  return (
    <Button onClick={callback} size="sm" className="me-3">
      <i className="fa fa-pencil" /> {translate('Edit')}
    </Button>
  );
};

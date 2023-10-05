import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { OVERVIEW_FORM_ID } from './constants';
import { EditOfferingProps } from './types';

const EditOverviewDialog = lazyComponent(
  () => import('./EditOverviewDialog'),
  'EditOverviewDialog',
);

export const EditOverviewButton: FC<EditOfferingProps> = (props) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditOverviewDialog, {
        resolve: props,
        formId: OVERVIEW_FORM_ID,
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

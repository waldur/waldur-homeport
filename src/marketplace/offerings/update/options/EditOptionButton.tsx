import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { OfferingSectionProps } from '../types';

import { OPTION_FORM_ID } from './constants';

const EditOptionDialog = lazyComponent(
  () => import('./EditOptionDialog'),
  'EditOptionDialog',
);

export const EditOptionButton: FunctionComponent<
  OfferingSectionProps & {
    option;
    type;
  }
> = ({ offering, option, refetch, type }) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(EditOptionDialog, {
        resolve: { offering, option, refetch, type },
        formId: OPTION_FORM_ID,
      }),
    );
  };
  return (
    <Button onClick={callback} size="sm" className="me-3">
      <i className="fa fa-pencil" /> {translate('Edit')}
    </Button>
  );
};

import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

import { RowEditButton } from '../RowEditButton';
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
  return <RowEditButton onClick={callback} size="sm" />;
};

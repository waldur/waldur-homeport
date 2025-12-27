import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditButton } from '@waldur/form/EditButton';
import { openModalDialog } from '@waldur/modal/actions';

import { OfferingSectionProps } from '../types';

import { OPTION_FORM_ID } from './constants';

const EditOptionDialog = lazyComponent(() =>
  import('./EditOptionDialog').then((module) => ({
    default: module.EditOptionDialog,
  })),
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
        size: 'lg',
      }),
    );
  };
  return <EditButton onClick={callback} size="sm" />;
};

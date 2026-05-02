import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

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
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditOptionDialog, {
      resolve: { offering, option, refetch, type },
      formId: OPTION_FORM_ID,
      size: 'lg',
    });
  };
  return <CompactEditButton onClick={callback} />;
};

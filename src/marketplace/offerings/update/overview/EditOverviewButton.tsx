import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { useModal } from '@/modal/actions';

import { EditOfferingProps } from './types';

const EditOverviewDialog = lazyComponent(() =>
  import('./EditOverviewDialog').then((module) => ({
    default: module.EditOverviewDialog,
  })),
);

export const EditOverviewButton: FC<EditOfferingProps> = (props) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditOverviewDialog, {
      resolve: props,
      size: 'lg',
    });
  };
  return (
    <CompactEditButton
      onClick={callback}
      disabled={props.disabled}
      variant="secondary"
    />
  );
};

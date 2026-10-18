import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { EditOfferingChecklistProps } from './types';

const EditOfferingChecklistDialog = lazyComponent(() =>
  import('./EditOfferingChecklistDialog').then((module) => ({
    default: module.EditOfferingChecklistDialog,
  })),
);

export const EditChecklistButton: FC<EditOfferingChecklistProps> = (props) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditOfferingChecklistDialog, {
      resolve: props,
    });
  };
  return (
    <CompactEditButton
      onClick={callback}
      variant="secondary"
      fieldName={translate('Compliance checklist')}
    />
  );
};

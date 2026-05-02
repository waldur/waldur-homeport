import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

import { ADD_COMPONENT_FORM_ID } from './constants';

const AddComponentDialog = lazyComponent(() =>
  import('./AddComponentDialog').then((module) => ({
    default: module.AddComponentDialog,
  })),
);

export const AddComponentButton: FunctionComponent<{
  offering;
  refetch;
}> = ({ offering, refetch }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(AddComponentDialog, {
      resolve: { offering, refetch },
      formId: ADD_COMPONENT_FORM_ID,
    });
  };
  return (
    <ActionButton
      iconNode={<PlusCircleIcon weight="bold" />}
      title={translate('Add component')}
      action={callback}
    />
  );
};

import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import { OPTION_FORM_ID } from './constants';

const EditOptionDialog = lazyComponent(() =>
  import('./EditOptionDialog').then((module) => ({
    default: module.EditOptionDialog,
  })),
);

export const EditOptionAction: FunctionComponent<{
  offering;
  option;
  type;
  refetch;
}> = ({ offering, option, refetch, type }) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(EditOptionDialog, {
      resolve: { offering, option, refetch, type },
      formId: OPTION_FORM_ID,
      size: 'lg',
    });
  };
  return (
    <ActionItem
      title={translate('Edit')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={callback}
    />
  );
};

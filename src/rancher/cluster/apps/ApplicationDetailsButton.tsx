import { EyeIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const ApplicationDetailsDialog = lazyComponent(() =>
  import('./ApplicationDetailsDialog').then((module) => ({
    default: module.ApplicationDetailsDialog,
  })),
);

export const ApplicationDetailsButton: FunctionComponent<any> = (props) => {
  const { openDialog } = useModal();
  const callback = () =>
    openDialog(ApplicationDetailsDialog, {
      resolve: { application: props.application },
    });
  return (
    <ActionItem
      title={translate('Details')}
      action={callback}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};

import { EyeIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const ApplicationDetailsDialog = lazyComponent(() =>
  import('./ApplicationDetailsDialog').then((module) => ({
    default: module.ApplicationDetailsDialog,
  })),
);

const applicationDetailsDialog = (application) =>
  openModalDialog(ApplicationDetailsDialog, {
    resolve: { application },
  });

export const ApplicationDetailsButton: FunctionComponent<any> = (props) => {
  const dispatch = useDispatch();
  const callback = () => dispatch(applicationDetailsDialog(props.application));
  return (
    <ActionItem
      title={translate('Details')}
      action={callback}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};

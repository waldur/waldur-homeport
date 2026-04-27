import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { OpenStackRouter } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionItemType } from '@/resource/actions/types';

const SetRoutesDialog = lazyComponent(() =>
  import('./SetRoutesDialog').then((module) => ({
    default: module.SetRoutesDialog,
  })),
);

export const SetRoutersButton: ActionItemType<OpenStackRouter> = ({
  resource,
}) => {
  const dispatch = useDispatch();
  const openDialog = () =>
    dispatch(
      openModalDialog(SetRoutesDialog, {
        resolve: {
          router: resource,
        },
      }),
    );
  return (
    <ActionItem
      title={translate('Set static routes')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={openDialog}
    />
  );
};

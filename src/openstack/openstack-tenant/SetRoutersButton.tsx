import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { OpenStackRouter } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

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

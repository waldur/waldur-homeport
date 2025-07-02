import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { OpenStackInstance } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const SetAllowedAddressPairsDialog = lazyComponent(() =>
  import('./SetAllowedAddressPairsDialog').then((module) => ({
    default: module.SetAllowedAddressPairsDialog,
  })),
);

export const SetAllowedAddressPairsButton: FunctionComponent<{
  instance: OpenStackInstance;
  port;
}> = ({ instance, port }) => {
  const dispatch = useDispatch();
  const openDialog = () =>
    dispatch(
      openModalDialog(SetAllowedAddressPairsDialog, {
        resolve: {
          instance,
          port,
        },
        size: 'lg',
      }),
    );
  return (
    <ActionItem
      title={translate('Set allowed address pairs')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={openDialog}
    />
  );
};

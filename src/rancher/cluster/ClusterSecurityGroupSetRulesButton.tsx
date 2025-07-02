import { ShieldPlusIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const ClusterSecurityGroupSetRulesDialog = lazyComponent(() =>
  import('./ClusterSecurityGroupSetRulesDialog').then((module) => ({
    default: module.ClusterSecurityGroupSetRulesDialog,
  })),
);

export const ClusterSecurityGroupSetRulesButton: ActionItemType = ({
  resource,
  refetch,
}) => (
  <DialogActionItem
    resource={resource}
    title={translate('Set rules')}
    modalComponent={ClusterSecurityGroupSetRulesDialog}
    extraResolve={{ refetch }}
    dialogSize="lg"
    iconNode={<ShieldPlusIcon weight="bold" />}
  />
);

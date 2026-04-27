import { ArrowsLeftRightIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { OpenstackFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { DialogActionItem } from '@/resource/actions/DialogActionItem';

import { TenantActionProps } from './types';

const MigrateTenantDialog = lazyComponent(() =>
  import('./MigrateTenantDialog').then((module) => ({
    default: module.MigrateTenantDialog,
  })),
);

export const MigrateTenantAction: FC<TenantActionProps> = ({
  resource,
  refetch,
}) =>
  isFeatureVisible(OpenstackFeatures.show_migrations) ? (
    <DialogActionItem
      title={translate('Replicate')}
      iconNode={<ArrowsLeftRightIcon weight="bold" />}
      modalComponent={MigrateTenantDialog}
      resource={resource}
      extraResolve={{ refetch }}
    />
  ) : null;

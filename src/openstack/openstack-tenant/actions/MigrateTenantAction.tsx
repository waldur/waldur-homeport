import { ArrowsLeftRight } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { OpenstackFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

import { TenantActionProps } from './types';

const MigrateTenantDialog = lazyComponent(
  () => import('./MigrateTenantDialog'),
  'MigrateTenantDialog',
);

export const MigrateTenantAction: FC<TenantActionProps> = ({
  resource,
  refetch,
}) =>
  isFeatureVisible(OpenstackFeatures.show_migrations) ? (
    <DialogActionItem
      title={translate('Migrate')}
      iconNode={<ArrowsLeftRight />}
      modalComponent={MigrateTenantDialog}
      resource={resource}
      extraResolve={{ refetch }}
    />
  ) : null;

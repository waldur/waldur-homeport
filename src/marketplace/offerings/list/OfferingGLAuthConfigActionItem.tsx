import { EyeIcon } from '@phosphor-icons/react';
import {
  marketplaceProviderOfferingsGlauthTreeRetrieve,
  marketplaceProviderOfferingsGlauthUsersConfigRetrieve,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const GLAuthConfigDialog = lazyComponent(() =>
  import('../update/integration/GLAuthConfigDialog').then((module) => ({
    default: module.GLAuthConfigDialog,
  })),
);

export const OfferingGLAuthConfigActionItem = ({ row }) => {
  const { openDialog } = useModal();
  // GLAuth config only exists for offerings that auto-create offering users.
  if (!row.service_provider_can_create_offering_user) {
    return null;
  }
  // Fetch lazily on click so the list does not issue a request per row.
  const callback = async () => {
    const [config, tree] = await Promise.all([
      marketplaceProviderOfferingsGlauthUsersConfigRetrieve({
        path: { uuid: row.uuid },
        parseAs: 'text',
        headers: { Accept: 'text/plain' },
      }).then((response) => response.data),
      marketplaceProviderOfferingsGlauthTreeRetrieve({
        path: { uuid: row.uuid },
      }).then((response) => response.data ?? null),
    ]);
    openDialog(GLAuthConfigDialog, {
      resolve: { offering: row, config, tree },
      size: 'lg',
    });
  };
  return (
    <ActionItem
      title={translate('View GLAuth configuration')}
      action={callback}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};

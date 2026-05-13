import { GearIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { ServiceProvider } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const SiteAgentConfigDialog = lazyComponent(() =>
  import('@/site-agent/SiteAgentConfigDialog').then((module) => ({
    default: module.SiteAgentConfigDialog,
  })),
);

interface SiteAgentConfigActionProps {
  serviceProvider: ServiceProvider;
}

export const SiteAgentConfigAction: FC<SiteAgentConfigActionProps> = ({
  serviceProvider,
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Generate Site Agent Config')}
      action={() => {
        openDialog(SiteAgentConfigDialog, {
          resolve: { provider: { uuid: serviceProvider?.uuid } },
          size: 'lg',
        });
      }}
      iconNode={<GearIcon weight="bold" />}
      disabled={!serviceProvider}
    />
  );
};

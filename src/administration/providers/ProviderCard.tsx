import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { Badge, Menu } from 'waldur-ui';

import { OIDC_TYPES } from '@/auth/providers/constants';
import { IdentityProviderLogo } from '@/auth/providers/IdentityProviderLogo';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

const CreateProviderDialog = lazyComponent(() =>
  import('./CreateProviderDialog').then((module) => ({
    default: module.CreateProviderDialog,
  })),
);

const UpdateProviderDialog = lazyComponent(() =>
  import('./UpdateProviderDialog').then((module) => ({
    default: module.UpdateProviderDialog,
  })),
);

const ProviderUsersDialog = lazyComponent(() =>
  import('./ProviderUsersDialog').then((module) => ({
    default: module.ProviderUsersDialog,
  })),
);

const ProviderDetailsDialog = lazyComponent(() =>
  import('./ProviderDetailsDialog').then((module) => ({
    default: module.ProviderDetailsDialog,
  })),
);

const OidcDiscoveryDialog = lazyComponent(() =>
  import('./oidc-discovery/OidcDiscoveryDialog').then((module) => ({
    default: module.OidcDiscoveryDialog,
  })),
);

const ProviderStatusMenu = ({
  provider,
  canEdit,
  onEdit,
  onDiscover,
  onCreate,
  onShowUsers,
  onShowDetails,
}: {
  provider: any;
  canEdit: boolean;
  onEdit: () => void;
  onDiscover?: () => void;
  onCreate: () => void;
  onShowUsers: () => void;
  onShowDetails?: () => void;
}) => {
  const status =
    provider?.is_active === true
      ? translate('Enabled')
      : provider?.is_active === false
        ? translate('Disabled')
        : translate('Not configured');
  const variant =
    provider?.is_active === true
      ? 'primary'
      : provider?.is_active === false
        ? 'warning'
        : 'tertiary';
  const hasMenu = canEdit || Boolean(provider);

  if (!hasMenu) {
    return (
      <Badge
        variant={variant === 'tertiary' ? 'neutral' : variant}
        tone="outline"
      >
        {status}
      </Badge>
    );
  }

  return (
    <Menu>
      <Menu.TriggerButton size="lg" variant={variant}>
        {status}
      </Menu.TriggerButton>
      <Menu.Content look="actions" side="bottom">
        {provider ? (
          <>
            {canEdit && (
              <Menu.Item onSelect={onEdit}>{translate('Edit')}</Menu.Item>
            )}
            {canEdit && onDiscover && (
              <Menu.Item onSelect={onDiscover}>
                {translate('Re-discover')}
              </Menu.Item>
            )}
            <Menu.Item onSelect={onShowUsers}>{translate('Users')}</Menu.Item>
            {onShowDetails && (
              <Menu.Item onSelect={onShowDetails}>
                {translate('Details')}
              </Menu.Item>
            )}
          </>
        ) : (
          <>
            <Menu.Item onSelect={onCreate}>
              {translate('Add identity provider')}
            </Menu.Item>
            {onDiscover && (
              <Menu.Item onSelect={onDiscover}>
                {translate('Discovery wizard')}
              </Menu.Item>
            )}
          </>
        )}
      </Menu.Content>
    </Menu>
  );
};

interface ProviderCardProps {
  title: string;
  description: string;
  provider: any;
  type: string;
  refetch(): void;
  editable?: boolean;
}

export const ProviderCard: FC<ProviderCardProps> = ({
  title,
  description,
  provider,
  type,
  refetch,
  editable = true,
}) => {
  const canEdit = editable && Boolean(useUser()?.is_staff);
  const { openDialog } = useModal();

  const createProvider = () => {
    openDialog(CreateProviderDialog, {
      resolve: { type, refetch },
    });
  };

  const updateProvider = () => {
    openDialog(UpdateProviderDialog, {
      resolve: { provider, type, refetch },
    });
  };

  const showUsers = () => {
    openDialog(ProviderUsersDialog, {
      resolve: { type, refetch },
      size: 'lg',
    });
  };

  const showDetails = () => {
    openDialog(ProviderDetailsDialog, {
      resolve: { type, refetch },
      size: 'lg',
      provider: provider,
    });
  };

  const openDiscovery = () => {
    openDialog(OidcDiscoveryDialog, {
      resolve: { provider, type, refetch },
      size: 'xl',
    });
  };

  return (
    <Card className="bg-tertiary dark:bg-quaternary min-h-150px border-[1px] border-transparent hover:border-secondary cursor-pointer">
      <Card.Body className="pe-5">
        <div className="flex items-center h-full">
          <div className="flex flex-row justify-between h-full grow">
            <div
              style={{
                width: 50,
                marginRight: 17,
              }}
            >
              <IdentityProviderLogo name={type} maxHeight={40} />
            </div>
            <div className="grow">
              <h1 className="text-xl text-nowrap font-bold">{title}</h1>
              <p className="text-sm text-primary">{description}</p>
              <ProviderStatusMenu
                provider={provider}
                canEdit={canEdit}
                onEdit={updateProvider}
                onDiscover={
                  OIDC_TYPES.includes(type) ? openDiscovery : undefined
                }
                onCreate={createProvider}
                onShowUsers={showUsers}
                onShowDetails={
                  provider?.is_active && OIDC_TYPES.includes(provider.provider)
                    ? showDetails
                    : undefined
                }
              />
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

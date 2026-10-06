import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { Menu } from 'waldur-ui';

import { OIDC_TYPES } from '@/auth/providers/constants';
import { IdentityProviderLogo } from '@/auth/providers/IdentityProviderLogo';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
    <Card className="bg-light min-h-150px border border-secondary border-hover">
      <Card.Body className="pe-5">
        <div className="d-flex align-items-center h-100">
          <div className="d-flex flex-row justify-content-between h-100 flex-grow-1">
            <div
              style={{
                width: 50,
                marginRight: 17,
              }}
            >
              <IdentityProviderLogo name={type} maxHeight={40} />
            </div>
            <div className="flex-grow-1">
              <h1 className="fs-2 text-nowrap fw-boldest">{title}</h1>
              <p className="fs-6 text-dark">{description}</p>
              <Menu>
                <Menu.TriggerButton
                  size="lg"
                  variant={
                    provider?.is_active === true
                      ? 'primary'
                      : provider?.is_active === false
                        ? 'warning'
                        : 'tertiary'
                  }
                >
                  {provider?.is_active === true
                    ? translate('Enabled')
                    : provider?.is_active === false
                      ? translate('Disabled')
                      : translate('Not configured')}
                </Menu.TriggerButton>
                <Menu.Content look="actions" side="bottom">
                  {provider ? (
                    <>
                      {editable && (
                        <Menu.Item onSelect={updateProvider}>
                          {translate('Edit')}
                        </Menu.Item>
                      )}
                      {editable && OIDC_TYPES.includes(type) && (
                        <Menu.Item onSelect={openDiscovery}>
                          {translate('Re-discover')}
                        </Menu.Item>
                      )}
                      <Menu.Item onSelect={showUsers}>
                        {translate('Users')}
                      </Menu.Item>
                      {provider.is_active &&
                        OIDC_TYPES.includes(provider.provider) && (
                          <Menu.Item onSelect={showDetails}>
                            {translate('Details')}
                          </Menu.Item>
                        )}
                    </>
                  ) : (
                    <>
                      <Menu.Item onSelect={createProvider}>
                        {translate('Add identity provider')}
                      </Menu.Item>
                      {OIDC_TYPES.includes(type) && (
                        <Menu.Item onSelect={openDiscovery}>
                          {translate('Discovery wizard')}
                        </Menu.Item>
                      )}
                    </>
                  )}
                </Menu.Content>
              </Menu>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

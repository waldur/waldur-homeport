import { FC } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { OIDC_TYPES } from '@/auth/providers/constants';
import { IdentityProviderLogo } from '@/auth/providers/IdentityProviderLogo';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionDropdownButton } from '@/table/ActionDropdownButton';

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
  const dispatch = useDispatch();

  const createProvider = () => {
    dispatch(
      openModalDialog(CreateProviderDialog, {
        resolve: { type, refetch },
      }),
    );
  };

  const updateProvider = () => {
    dispatch(
      openModalDialog(UpdateProviderDialog, {
        resolve: { provider, type, refetch },
      }),
    );
  };

  const showUsers = () => {
    dispatch(
      openModalDialog(ProviderUsersDialog, {
        resolve: { type, refetch },
        size: 'lg',
      }),
    );
  };

  const showDetails = () => {
    dispatch(
      openModalDialog(ProviderDetailsDialog, {
        resolve: { type, refetch },
        size: 'lg',
        provider: provider,
      }),
    );
  };

  const openDiscovery = () => {
    dispatch(
      openModalDialog(OidcDiscoveryDialog, {
        resolve: { provider, type, refetch },
        size: 'xl',
      }),
    );
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
              <ActionDropdownButton
                variant={
                  provider?.is_active === true
                    ? 'primary'
                    : provider?.is_active === false
                      ? 'warning'
                      : 'dark'
                }
                title={
                  provider?.is_active === true
                    ? translate('Enabled')
                    : provider?.is_active === false
                      ? translate('Disabled')
                      : translate('Not configured')
                }
              >
                {provider ? (
                  <>
                    {editable && (
                      <Dropdown.Item onClick={updateProvider}>
                        {translate('Edit')}
                      </Dropdown.Item>
                    )}
                    {editable && OIDC_TYPES.includes(type) && (
                      <Dropdown.Item onClick={openDiscovery}>
                        {translate('Re-discover')}
                      </Dropdown.Item>
                    )}
                    <Dropdown.Item onClick={showUsers}>
                      {translate('Users')}
                    </Dropdown.Item>
                    {provider.is_active &&
                      OIDC_TYPES.includes(provider.provider) && (
                        <Dropdown.Item onClick={showDetails}>
                          {translate('Details')}
                        </Dropdown.Item>
                      )}
                  </>
                ) : (
                  <>
                    <Dropdown.Item onClick={createProvider}>
                      {translate('Add identity provider')}
                    </Dropdown.Item>
                    {OIDC_TYPES.includes(type) && (
                      <Dropdown.Item onClick={openDiscovery}>
                        {translate('Discovery wizard')}
                      </Dropdown.Item>
                    )}
                  </>
                )}
              </ActionDropdownButton>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

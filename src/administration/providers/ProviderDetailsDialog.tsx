import { useQuery } from '@tanstack/react-query';
import { ListGroup, Modal } from 'react-bootstrap';

import { getIdentityProviders } from '@waldur/administration/api';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { CancelButton } from '@waldur/form';
import { translate } from '@waldur/i18n';

export const ProviderDetailsDialog = (props) => {
  const neededProvider = props.provider.provider;
  const { data, isLoading, error, refetch } = useQuery<
    Record<string, { is_active }>,
    {},
    {}
  >(['IdentityProvidersList'], () =>
    getIdentityProviders().then((providers) =>
      providers.reduce((result, item) => {
        if (item.provider === neededProvider) {
          return { ...result, [item.provider]: item };
        }
        return result;
      }, {}),
    ),
  );

  const renderUrlItem = (urlKey, label) => {
    const url = data[neededProvider][urlKey];
    return (
      url && (
        <ListGroup.Item key={urlKey}>
          <div className="ms-2 me-auto">
            <div className="fw-bold">{label}</div>
            <div className="copy-to-clipboard-container">
              {url}
              <CopyToClipboardButton
                className="mx-2 text-hover-primary cursor-pointer d-inline z-index-1"
                value={url}
              />
            </div>
          </div>
        </ListGroup.Item>
      )
    );
  };

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to load identity provider details')}
          loadData={refetch}
        />
      ) : data ? (
        <>
          <Modal.Header closeButton>
            <Modal.Title>
              {translate('Details for {provider}', {
                provider: props.resolve.type,
              })}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup>
              {data[neededProvider] && (
                <>
                  {renderUrlItem('discovery_url', 'Discovery URL')}
                  {renderUrlItem('userinfo_url', 'User info URL')}
                  {renderUrlItem('token_url', 'Token URL')}
                  {renderUrlItem('auth_url', 'Auth URL')}
                  {renderUrlItem('logout_url', 'Logout URL')}
                  {renderUrlItem('management_url', 'Management URL')}
                </>
              )}
            </ListGroup>
          </Modal.Body>
          <Modal.Footer>
            <CancelButton label={translate('OK')} />
          </Modal.Footer>
        </>
      ) : null}
    </>
  );
};

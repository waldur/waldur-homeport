import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import {
  marketplaceServiceProvidersGlauthTreeRetrieve,
  marketplaceServiceProvidersGlauthUsersConfigRetrieve,
  ServiceProvider,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { CopyToClipboard } from '@/core/CopyToClipboard';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { MonacoEditor } from '@/form/MonacoEditor';
import { translate } from '@/i18n';
import { GLAuthTreeView } from '@/marketplace/offerings/update/integration/GLAuthTreeView';

interface ProviderDirectoryProps {
  provider: ServiceProvider;
}

type View = 'toml' | 'tree';

/**
 * The GLAuth directory the offerings sharing accounts serve together: each
 * person once, with the groups of all those offerings.
 */
export const ProviderDirectory: FC<ProviderDirectoryProps> = ({ provider }) => {
  const [view, setView] = useState<View>('toml');
  const configQuery = useQuery({
    queryKey: ['ProviderGLAuthConfig', provider.uuid],
    queryFn: () =>
      marketplaceServiceProvidersGlauthUsersConfigRetrieve({
        path: { uuid: provider.uuid },
        parseAs: 'text',
        headers: { Accept: 'text/plain' },
      }).then((response) => response.data as unknown as string),
    refetchOnWindowFocus: false,
  });
  const treeQuery = useQuery({
    queryKey: ['ProviderGLAuthTree', provider.uuid],
    queryFn: () =>
      marketplaceServiceProvidersGlauthTreeRetrieve({
        path: { uuid: provider.uuid },
      }).then((response) => response.data),
    refetchOnWindowFocus: false,
  });

  if (configQuery.isLoading || treeQuery.isLoading) {
    return <LoadingSpinner />;
  }
  if (configQuery.error || treeQuery.error || !treeQuery.data) {
    return (
      <LoadingErred
        loadData={() => {
          configQuery.refetch();
          treeQuery.refetch();
        }}
      />
    );
  }

  const tree = treeQuery.data;
  const config = configQuery.data;
  return (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title>
          <h3>{translate('GLAuth directory')}</h3>
        </Card.Title>
        {view === 'toml' && config && (
          <div className="card-toolbar flex-grow-1 justify-content-end">
            <CopyToClipboard
              value={config}
              label={translate('Copy')}
              className="btn-tertiary w-150px"
            />
          </div>
        )}
      </Card.Header>
      <Card.Body>
        {tree.offerings.length === 0 ? (
          <p className="text-muted mb-0">
            {translate(
              'No offering of this service provider shares accounts yet. Set the account scope to per service provider, and enable automatic creation of offering users on the offerings.',
            )}
          </p>
        ) : (
          <>
            <p className="text-muted">
              {translate(
                'One directory for the offerings that share accounts: {offerings}. Each person appears once, with the groups of all those offerings.',
                {
                  offerings: tree.offerings
                    .map((offering) => offering.name)
                    .join(', '),
                },
              )}
            </p>
            {tree.warnings.map((warning) => (
              <AlertItem
                key={warning}
                variant="warning"
                title={warning}
                className="mb-4"
              />
            ))}
            <Tab.Container
              activeKey={view}
              onSelect={(key) => key && setView(key as View)}
            >
              <Nav variant="tabs" className="nav-line-tabs mb-5">
                <Nav.Item>
                  <Nav.Link eventKey="toml">
                    {translate('TOML config')}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="tree">{translate('Directory')}</Nav.Link>
                </Nav.Item>
              </Nav>
              <Tab.Content>
                <Tab.Pane eventKey="toml">
                  <div className="border rounded overflow-hidden">
                    <MonacoEditor
                      value={config}
                      language="ini"
                      height={400}
                      readOnly
                    />
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey="tree" mountOnEnter>
                  <GLAuthTreeView
                    tree={{
                      // The tree view names its root after one offering; here
                      // the directory is the provider's.
                      offering: {
                        uuid: provider.uuid,
                        name: provider.customer_name,
                        slug: provider.customer_slug ?? '',
                      },
                      groups: tree.groups,
                      users: tree.users,
                      robot_accounts: tree.robot_accounts,
                    }}
                  />
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

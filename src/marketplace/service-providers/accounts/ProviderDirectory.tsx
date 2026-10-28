import { useQuery } from '@tanstack/react-query';
import { FC, useMemo, useState } from 'react';
import {
  marketplaceServiceProvidersGlauthTreeRetrieve,
  marketplaceServiceProvidersGlauthUsersConfigRetrieve,
  ServiceProvider,
} from 'waldur-js-client';

import { AlertItem, Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

import { CopyToClipboard } from '@/core/CopyToClipboard';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { MonacoEditor } from '@/form/MonacoEditor';
import { translate } from '@/i18n';
import {
  GLAuthTreeView,
  type GlauthTree,
} from '@/marketplace/offerings/update/integration/GLAuthTreeView';

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
  // One object per fetched tree: the view rebuilds and re-filters its rows
  // whenever it gets a new one.
  const directory = useMemo<GlauthTree | undefined>(
    () =>
      treeQuery.data && {
        // The tree view names its root after one offering; here the
        // directory is the provider's.
        offering: {
          uuid: provider.uuid,
          name: provider.customer_name,
          slug: provider.customer_slug ?? '',
        },
        groups: treeQuery.data.groups,
        users: treeQuery.data.users,
        robot_accounts: treeQuery.data.robot_accounts,
      },
    [
      treeQuery.data,
      provider.uuid,
      provider.customer_name,
      provider.customer_slug,
    ],
  );

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
    <div className="card card-bordered">
      <div className="card-header">
        <div className="card-title">
          <h3>{translate('GLAuth directory')}</h3>
        </div>
        {view === 'toml' && config && (
          <div className="card-toolbar grow justify-end">
            <CopyToClipboard
              value={config}
              label={translate('Copy')}
              className="w-[150px]"
            />
          </div>
        )}
      </div>
      <div className="card-body">
        {tree.offerings.length === 0 ? (
          <p className="text-quaternary mb-0">
            {translate(
              'No offering of this service provider shares accounts yet. Set the account scope to per service provider, and enable automatic creation of offering users on the offerings.',
            )}
          </p>
        ) : (
          <>
            <p className="text-quaternary">
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
                className="mb-3"
              />
            ))}
            <Tabs
              mount="visited"
              value={view}
              onValueChange={(key) => key && setView(key as View)}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="toml">
                  {translate('TOML config')}
                </TabsTrigger>
                <TabsTrigger value="tree">{translate('Directory')}</TabsTrigger>
              </TabsList>
              <>
                <TabsContent value="toml">
                  <div className="border rounded overflow-hidden">
                    <MonacoEditor
                      value={config}
                      language="ini"
                      height={400}
                      readOnly
                    />
                  </div>
                </TabsContent>
                <TabsContent value="tree">
                  <GLAuthTreeView tree={directory} />
                </TabsContent>
              </>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

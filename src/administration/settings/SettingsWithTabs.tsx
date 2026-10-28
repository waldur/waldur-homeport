import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import classNames from 'classnames';
import { FC, ReactNode, useMemo } from 'react';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useUrlTab } from '@/navigation/useUrlTab';
import { SettingsDescription } from '@/SettingsDescription';
import { TableQuery } from '@/table/TableQuery';

import { FieldRow } from './FieldRow';
import { getKeyTitle } from './utils';

export interface SettingsTab {
  key: string;
  title: ReactNode;
  groupName: string;
}

interface SettingsWithTabsProps {
  tabs: SettingsTab[];
  queryKey: string;
  title?: string;
  syncWithUrlKey?: string;
  getItemValue?: (item: any, data: any) => any;
  getItemOnEdit?: (item: any, data: any) => (() => void) | undefined;
  getItemIsLoading?: (item: any, isLoading: boolean) => boolean;
  className?: string;
}

export const SettingsWithTabs: FC<SettingsWithTabsProps> = ({
  tabs,
  queryKey: queryKeyProp,
  title,
  syncWithUrlKey = 'tab',
  getItemValue,
  getItemOnEdit,
  getItemIsLoading,
  className,
}) => {
  const { state, params } = useCurrentStateAndParams();
  const router = useRouter();
  const { activeKey, handleSelect } = useUrlTab(tabs, syncWithUrlKey);

  // Sync search query with URL
  const query = (params.q as string) || '';
  const setQuery = (newQuery: string) => {
    router.stateService.go(
      state.name,
      { ...params, q: newQuery || undefined },
      { location: 'replace' },
    );
  };

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: [queryKeyProp],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tabs.map((tab) => {
      const group = SettingsDescription.find(
        (g) => g.description === tab.groupName,
      );
      if (!group) return { tab, items: [] };

      const items = q
        ? group.items.filter(
            (item) =>
              getKeyTitle(item.key).toLowerCase().includes(q) ||
              item.description?.toLowerCase().includes(q) ||
              item.key.toLowerCase().includes(q),
          )
        : group.items;

      return { tab, items };
    });
  }, [tabs, query]);

  const getFilteredCount = (tabKey: string) => {
    const group = filteredGroups.find((g) => g.tab.key === tabKey);
    return group?.items.length || 0;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <LoadingErred
        message={translate('Unable to load settings.')}
        loadData={refetch}
      />
    );
  }

  return (
    <div className={classNames('card card-bordered', className)}>
      {title && (
        <div className="card-header">
          <div className="flex flex-col">
            <div className="card-title mb-0">
              <h3>{title}</h3>
            </div>
          </div>
          <div className="card-toolbar flex-nowrap">
            <TableQuery query={query} setQuery={setQuery} />
          </div>
        </div>
      )}
      <div className="card-body">
        <Tabs mount="active" value={activeKey} onValueChange={handleSelect}>
          <TabsList className="mb-4">
            {tabs.map((tab) => {
              const filteredCount = getFilteredCount(tab.key);
              const hasMatches = filteredCount > 0;
              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  count={query ? filteredCount : undefined}
                  className={!hasMatches && query ? 'text-quaternary' : ''}
                >
                  {tab.title}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <>
            {filteredGroups.map(({ tab, items }) => (
              <TabsContent key={tab.key} value={tab.key}>
                {items.length > 0 ? (
                  <FormTable>
                    {items.map((item) => (
                      <FieldRow
                        key={item.key}
                        item={item}
                        value={
                          getItemValue
                            ? getItemValue(item, data)
                            : data?.[item.key]
                        }
                        onEdit={getItemOnEdit?.(item, data)}
                        isLoading={getItemIsLoading?.(item, isLoading)}
                      />
                    ))}
                  </FormTable>
                ) : (
                  <p className="text-quaternary">
                    {translate('No matching settings in this section.')}
                  </p>
                )}
              </TabsContent>
            ))}
          </>
        </Tabs>
      </div>
    </div>
  );
};

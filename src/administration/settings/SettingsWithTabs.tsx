import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { FC, ReactNode, useMemo } from 'react';
import { Badge, Card, Nav, Tab } from 'react-bootstrap';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { SettingsDescription } from '@/SettingsDescription';
import { TableQuery } from '@/table/TableQuery';

import { FieldRow } from './FieldRow';
import { useSettingsUrlSync } from './useSettingsUrlSync';
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
  const { activeKey, handleSelect, defaultActiveKey, params, state, router } =
    useSettingsUrlSync(tabs, syncWithUrlKey);

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
    <Card className={classNames('card-bordered', className)}>
      {title && (
        <Card.Header>
          <div className="d-flex flex-column">
            <Card.Title className="mb-0">
              <h3>{title}</h3>
            </Card.Title>
          </div>
          <div className="card-toolbar flex-nowrap">
            <TableQuery query={query} setQuery={setQuery} />
          </div>
        </Card.Header>
      )}
      <Card.Body>
        <Tab.Container
          defaultActiveKey={defaultActiveKey}
          activeKey={activeKey}
          onSelect={handleSelect}
        >
          <Nav variant="tabs" className="nav-line-tabs mb-5">
            {tabs.map((tab) => {
              const filteredCount = getFilteredCount(tab.key);
              const hasMatches = filteredCount > 0;
              return (
                <Nav.Item key={tab.key}>
                  <Nav.Link
                    eventKey={tab.key}
                    className={!hasMatches && query ? 'text-muted' : ''}
                  >
                    {tab.title}
                    {query && (
                      <Badge
                        bg={hasMatches ? 'light' : 'secondary'}
                        text={hasMatches ? 'dark' : 'white'}
                        className="ms-2"
                      >
                        {filteredCount}
                      </Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>
          <Tab.Content>
            {filteredGroups.map(({ tab, items }) => (
              <Tab.Pane key={tab.key} eventKey={tab.key} unmountOnExit>
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
                  <p className="text-muted">
                    {translate('No matching settings in this section.')}
                  </p>
                )}
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  );
};

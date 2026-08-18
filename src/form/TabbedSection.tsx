import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';

import { useSettingsUrlSync } from '@/administration/settings/useSettingsUrlSync';
import { Badge } from '@/core/Badge';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { TableQuery } from '@/table/TableQuery';

interface TabProps {
  title: ReactNode;
  children: ReactNode;
  id: string;
}

const TabbedSectionTab: FC<TabProps> = () => null;

interface TabbedSectionProps {
  title?: ReactNode;
  actions?: ReactNode;
  enableSearch?: boolean;
  hideActions?: boolean;
  children: ReactNode;
  // URL query param used to persist the active tab. Must be declared as a
  // dynamic param on the enclosing route, otherwise UI-Router drops it and the
  // active tab silently resets to the first tab on any re-render (e.g. after a
  // field save refetch). Defaults to 'section' to match the settings routes.
  syncKey?: string;
}

export const TabbedSection: FC<TabbedSectionProps> & { Tab: FC<TabProps> } = ({
  title,
  actions,
  enableSearch,
  hideActions,
  children,
  syncKey = 'section',
}) => {
  const [query, setQuery] = useState('');

  // 1. Extract tabs from children
  const tabs = useMemo(() => {
    return React.Children.toArray(children).filter(
      React.isValidElement,
    ) as React.ReactElement<TabProps>[];
  }, [children]);

  // Use the url sync
  // useSettingsUrlSync takes an array of { key: string, title: string }.
  const tabDefs = useMemo(
    () => tabs.map((tab) => ({ key: tab.props.id, title: tab.props.title })),
    [tabs],
  );

  const { activeKey, handleSelect, defaultActiveKey } = useSettingsUrlSync(
    tabDefs,
    syncKey,
  );

  // 2. Filter fields
  const processedTabs = useMemo(() => {
    return tabs.map((tab) => {
      let fields = React.Children.toArray(tab.props.children);

      if (enableSearch && query) {
        const lowerQuery = query.toLowerCase();
        fields = fields.filter((field) => {
          if (!React.isValidElement(field)) return false;
          const label = String(field.props.label || '').toLowerCase();
          const desc = String(field.props.description || '').toLowerCase();
          return label.includes(lowerQuery) || desc.includes(lowerQuery);
        });
      }

      return {
        id: tab.props.id,
        title: tab.props.title,
        fields,
        count: fields.length,
      };
    });
  }, [tabs, query, enableSearch]);

  const hasQuery = query.trim().length > 0;

  // 3. Auto-jump logic
  useEffect(() => {
    if (!hasQuery) return;
    const currentTab = processedTabs.find((t) => t.id === activeKey);
    if ((currentTab?.count ?? 0) > 0) return;
    const next = processedTabs.find((t) => t.count > 0);
    if (next && next.id !== activeKey) {
      handleSelect(next.id);
    }
  }, [hasQuery, activeKey, processedTabs, handleSelect]);

  return (
    <Card className="card-bordered">
      {(title || actions) && (
        <Card.Header>
          {title && (
            <Card.Title>
              <h3>{title}</h3>
            </Card.Title>
          )}
          {actions && (
            <div className="card-toolbar flex-grow-1 justify-content-end gap-3">
              {actions}
            </div>
          )}
        </Card.Header>
      )}
      <Card.Body>
        <Tab.Container
          defaultActiveKey={defaultActiveKey}
          activeKey={activeKey}
          onSelect={(key) => key && handleSelect(key)}
        >
          {enableSearch && (
            <div className="d-flex justify-content-end mb-3">
              <TableQuery query={query} setQuery={setQuery} />
            </div>
          )}
          <Nav variant="tabs" className="nav-line-tabs mb-5">
            {processedTabs.map((tab) => {
              const disabled = hasQuery && tab.count === 0;
              return (
                <Nav.Item key={tab.id}>
                  <Nav.Link
                    eventKey={tab.id}
                    disabled={disabled}
                    className={disabled ? 'text-muted' : ''}
                  >
                    {tab.title}
                    {enableSearch && hasQuery && (
                      <Badge
                        variant="secondary"
                        size="sm"
                        light
                        className="ms-2"
                      >
                        {tab.count}
                      </Badge>
                    )}
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>
          <Tab.Content>
            {processedTabs.map((tab) => (
              <Tab.Pane key={tab.id} eventKey={tab.id} unmountOnExit>
                {tab.fields.length > 0 ? (
                  <FormTable hideActions={hideActions}>{tab.fields}</FormTable>
                ) : (
                  <NoResult
                    title={translate('No results found')}
                    message={translate(
                      'No matching fields. Try a different search term.',
                    )}
                    callback={() => setQuery('')}
                    buttonTitle={translate('Clear search')}
                  />
                )}
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  );
};

TabbedSection.Tab = TabbedSectionTab;

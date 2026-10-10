import classNames from 'classnames';
import { FC, Fragment, ReactNode, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { Tabs, TabsContent, TabsList, TabsTrigger } from 'waldur-ui';

import { useUrlTab } from '@/navigation/useUrlTab';

import { TableProps } from './types';

export const TableWithTabs: FC<
  Pick<
    TableProps,
    'title' | 'subtitle' | 'tabs' | 'className' | 'headerClassName'
  > & {
    data?: Record<string, any>;
    syncWithUrlKey?: string;
    actions?: ReactNode | Array<{ activeKeys: string[]; component: ReactNode }>;
    headerActions?: ReactNode;
  }
> = ({
  title,
  subtitle,
  tabs,
  className,
  headerClassName,
  data = {},
  syncWithUrlKey,
  actions,
  headerActions,
}) => {
  const { activeKey, handleSelect } = useUrlTab(tabs, syncWithUrlKey, {
    history: 'push',
  });

  // The open tab's table portals its toolbar and refresh button into these
  // header slots. Callback refs re-render once both exist, so the panels mount
  // with real targets. Only the open panel is mounted (mount="active"), so a
  // tab switch unmounts the old table and its portalled controls with it.
  const [titleNode, setTitleNode] = useState<HTMLDivElement | null>(null);
  const [toolbarNode, setToolbarNode] = useState<HTMLDivElement | null>(null);

  return (
    <Card className={classNames('card-table card-bordered', className)}>
      <Card.Header className={headerClassName}>
        <Row className="card-toolbar g-0 gap-4 w-100">
          <Col xs>
            <Card.Title ref={setTitleNode}>
              <div className="me-2">
                <h3>{title}</h3>
                {Boolean(subtitle) && (
                  <small className="fs-6 fw-normal d-block mt-2">
                    {subtitle}
                  </small>
                )}
              </div>
            </Card.Title>
            {/* Portal destination */}
          </Col>
          <Col
            sm="auto"
            className="ms-auto mw-100 d-flex gap-4 flex-wrap flex-sm-nowrap text-nowrap"
          >
            {headerActions}
            <div
              ref={setToolbarNode}
              className="d-flex justify-content-sm-end flex-wrap flex-sm-nowrap text-nowrap gap-4"
            >
              {/* Portal destination */}
            </div>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="pt-3">
        <Tabs
          value={activeKey}
          onValueChange={handleSelect}
          mount="active"
          className="min-h-175px"
        >
          <div className="d-flex justify-content-between">
            <TabsList scrollable scrollClassName="flex-grow-1">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key}>
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {actions ? (
              Array.isArray(actions) && actions.length ? (
                <div className="d-flex align-items-center border-bottom gap-2">
                  {actions.map((action, index) => (
                    <Fragment key={index}>
                      {action.activeKeys.includes(activeKey)
                        ? action.component
                        : null}
                    </Fragment>
                  ))}
                </div>
              ) : (
                <div className="border-bottom">{actions as ReactNode}</div>
              )
            ) : null}
          </div>
          {titleNode && toolbarNode && (
            <div className="overflow-auto">
              {tabs.map((tab) => (
                <TabsContent key={tab.key} value={tab.key}>
                  <tab.component
                    {...data}
                    activeTab={activeKey}
                    portal={{ toolbar: toolbarNode, refresh: titleNode }}
                  />
                </TabsContent>
              ))}
            </div>
          )}
        </Tabs>
      </Card.Body>
    </Card>
  );
};

import classNames from 'classnames';
import { FC, Fragment, ReactNode, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import {
  resolveTabValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'waldur-ui';

import { TableProps } from './types';

export type BaseTableWithTabsProps = Pick<
  TableProps,
  'title' | 'subtitle' | 'tabs' | 'className' | 'headerClassName'
> & {
  data?: Record<string, any>;
  actions?: ReactNode | Array<{ activeKeys: string[]; component: ReactNode }>;
  headerActions?: ReactNode;
  /** The open tab, when the caller keeps it (e.g. in the URL); without it the
   * component keeps it itself, starting from the first tab. */
  activeKey?: string;
  onSelect?: (key: string) => void;
};

export const BaseTableWithTabs: FC<BaseTableWithTabsProps> = ({
  title,
  subtitle,
  tabs,
  className,
  headerClassName,
  data = {},
  actions,
  headerActions,
  activeKey: controlledKey,
  onSelect,
}) => {
  const [localKey, setLocalKey] = useState<string>();
  const activeKey = resolveTabValue(
    tabs.map((tab) => tab.key),
    controlledKey ?? localKey,
  );
  const handleSelect = onSelect ?? setLocalKey;

  // The open tab's table portals its toolbar and refresh button into these
  // header slots. Callback refs re-render once both exist, so the panels mount
  // with real targets. Only the open panel is mounted (mount="active"), so a
  // tab switch unmounts the old table and its portalled controls with it.
  const [titleNode, setTitleNode] = useState<HTMLDivElement | null>(null);
  const [toolbarNode, setToolbarNode] = useState<HTMLDivElement | null>(null);

  return (
    <Card className={classNames('card-table card-bordered', className)}>
      <Card.Header className={headerClassName}>
        <Row className="card-toolbar g-0 gap-4 w-full">
          <Col xs>
            <Card.Title ref={setTitleNode}>
              <div className="me-2">
                <h3>{title}</h3>
                {Boolean(subtitle) && (
                  <small className="text-sm font-normal block mt-2">
                    {subtitle}
                  </small>
                )}
              </div>
            </Card.Title>
            {/* Portal destination */}
          </Col>
          <Col
            sm="auto"
            className="ms-auto max-w-full flex gap-4 max-sm:flex-wrap text-nowrap"
          >
            {headerActions}
            <div
              ref={setToolbarNode}
              className="flex sm:justify-end max-sm:flex-wrap text-nowrap gap-4"
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
          <div className="flex justify-between">
            <TabsList scrollable scrollClassName="grow">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key}>
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {actions ? (
              Array.isArray(actions) && actions.length ? (
                <div className="flex items-center border-b-[1px] border-b-secondary gap-2">
                  {actions.map((action, index) => (
                    <Fragment key={index}>
                      {action.activeKeys.includes(activeKey)
                        ? action.component
                        : null}
                    </Fragment>
                  ))}
                </div>
              ) : (
                <div className="border-b-[1px] border-b-secondary">
                  {actions as ReactNode}
                </div>
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

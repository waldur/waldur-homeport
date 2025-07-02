import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Card, Col, Nav, Row, Tab } from 'react-bootstrap';

import { TableTabsContainer } from '@waldur/customer/list/TableTabsContainer';

import { TableProps } from './types';

export const TableWithTabs: FC<
  Pick<TableProps, 'title' | 'subtitle' | 'tabs'> & {
    data?: Record<string, any>;
    syncWithUrlKey?: string;
  }
> = ({ title, subtitle, tabs, data = {}, syncWithUrlKey }) => {
  const { state, params } = useCurrentStateAndParams();
  const router = useRouter();

  const [isRefsReady, setRefsReady] = useState(false);
  const [activeKey, setActiveKey] = useState<string | number | null>(null);
  const refToolbar = useRef<HTMLDivElement>(null);
  const refTitle = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (refToolbar.current && refTitle.current) {
      setRefsReady(true);
    }
  }, [refToolbar.current, refTitle.current]);

  const defaultActiveKey = useMemo(
    () => tabs.find((tab) => tab.key)?.key,
    [tabs],
  );

  // Sync activeKey with URL query if syncWithUrlKey is provided
  useEffect(() => {
    if (syncWithUrlKey) {
      const urlKey = params[syncWithUrlKey];
      if (urlKey && tabs.some((tab) => tab.key === urlKey)) {
        setActiveKey(urlKey);
      } else {
        setActiveKey(defaultActiveKey);
      }
    }
  }, [params, syncWithUrlKey, tabs, defaultActiveKey]);

  const handleSelect = (key: string | null) => {
    // Remove all children that came through the portal from the toolbar and title,
    // to prevent previous children to be visible when the new tab is rendered
    const childrenToBeRemoved = [];
    if (refToolbar.current) {
      const toolbarNode = refToolbar.current;
      childrenToBeRemoved.push(...Array.from(toolbarNode.childNodes));
    }
    if (refTitle.current) {
      const titleNode = refTitle.current;
      const children = Array.from(titleNode.childNodes);
      childrenToBeRemoved.push(...children.slice(1));
    }
    if (childrenToBeRemoved.length > 0) {
      for (const child of childrenToBeRemoved) {
        child.style.display = 'none';
      }
    }
    setActiveKey(key);

    // Update URL query if syncWithUrlKey is provided
    if (syncWithUrlKey && key) {
      router.stateService.go(state.name, { ...params, [syncWithUrlKey]: key });
    }
  };

  return (
    <Card className="card-table card-bordered">
      <Card.Header>
        <Row className="card-toolbar g-0 gap-4 w-100">
          <Col xs>
            <Card.Title ref={refTitle}>
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
          <Col sm="auto" className="ms-auto">
            <div
              ref={refToolbar}
              className="d-flex justify-content-sm-end flex-wrap flex-sm-nowrap text-nowrap gap-3"
            >
              {/* Portal destination */}
            </div>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="pt-0">
        <TableTabsContainer
          defaultActiveKey={defaultActiveKey}
          activeKey={activeKey ?? defaultActiveKey}
          onSelect={handleSelect}
          className="min-h-175px"
        >
          <div className="overflow-auto">
            <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
              {tabs.map((tab) => (
                <Nav.Item key={tab.key} className="text-nowrap">
                  <Nav.Link eventKey={tab.key}>{tab.title}</Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </div>
          {isRefsReady && (
            <Tab.Content className="overflow-auto">
              {tabs.map((tab) => (
                <Tab.Pane key={tab.key} eventKey={tab.key} unmountOnExit={true}>
                  <tab.component
                    {...data}
                    portal={{
                      toolbar: refToolbar.current,
                      refresh: refTitle.current,
                    }}
                  />
                </Tab.Pane>
              ))}
            </Tab.Content>
          )}
        </TableTabsContainer>
      </Card.Body>
    </Card>
  );
};

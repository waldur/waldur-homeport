import { ErrorBoundary } from '@sentry/react';
import React from 'react';
import { Nav, Col, Row, Tab, Card } from 'react-bootstrap';

import { ErrorMessage } from '@waldur/ErrorMessage';

import { MenuItem } from './MenuItem';
import { MenuItemType } from './types';

import './VerticalTabs.scss';

export const VerticalTabs = ({
  items,
  activeKey,
  containerId,
  defaultActiveKey,
  onSelect,
}: {
  items: MenuItemType[];
  containerId: string;
  activeKey?: string;
  defaultActiveKey?: any;
  onSelect?: React.EventHandler<any>;
}) => (
  <Card>
    <Tab.Container
      id={containerId}
      activeKey={activeKey}
      defaultActiveKey={defaultActiveKey}
      onSelect={onSelect}
      mountOnEnter
      unmountOnExit
    >
      <Row className="clearfix">
        <Col sm={3}>
          <Nav className="page-sidebar-menu">
            {items.map(
              (item) =>
                (item.visible === undefined || item.visible) && (
                  <Nav.Item key={item.key}>
                    <Nav.Link eventKey={item.key}>
                      <MenuItem item={item} />
                    </Nav.Link>
                  </Nav.Item>
                ),
            )}
          </Nav>
        </Col>
        <Col sm={9}>
          <Tab.Content>
            {items.map(
              (item) =>
                (item.visible === undefined || item.visible) && (
                  <Tab.Pane key={item.key} eventKey={item.key}>
                    <ErrorBoundary fallback={ErrorMessage}>
                      <item.component />
                    </ErrorBoundary>
                  </Tab.Pane>
                ),
            )}
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  </Card>
);

import { ErrorBoundary } from '@sentry/react';
import React from 'react';
import { Col, Row, Tab } from 'react-bootstrap';

import { ErrorMessage } from '@waldur/ErrorMessage';

import { SidebarMenu } from './SidebarMenu';
import { MenuItemType } from './types';

import './VerticalTabs.css';

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
        <SidebarMenu items={items} />
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
);

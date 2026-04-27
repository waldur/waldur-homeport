import { FC } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { OfferingComponent, ProviderPlanDetails } from 'waldur-js-client';

import { TableTabsContainer } from '@/customer/list/TableTabsContainer';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { PlanComponentsTable } from './PlanComponentsTable';
import { PlanResourcesTable } from './PlanResourcesTable';

interface OwnProps {
  row: ProviderPlanDetails;
  components: OfferingComponent[];
}

export const PlanExpandableRow: FC<OwnProps> = (props) => (
  <ExpandableContainer>
    <TableTabsContainer
      defaultActiveKey="components"
      unmountOnExit={true}
      className="min-h-375px"
    >
      <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
        <Nav.Item>
          <Nav.Link eventKey="components">{translate('Components')}</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="resources">{translate('Resources')}</Nav.Link>
        </Nav.Item>
      </Nav>

      <Tab.Content className="overflow-auto">
        <Tab.Pane eventKey="resources" unmountOnExit={true}>
          <PlanResourcesTable {...props} />
        </Tab.Pane>
        <Tab.Pane eventKey="components" unmountOnExit={true}>
          <PlanComponentsTable {...props} />
        </Tab.Pane>
      </Tab.Content>
    </TableTabsContainer>
  </ExpandableContainer>
);

import { ComponentType, FunctionComponent, ReactNode } from 'react';
import { Nav, Tab } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import * as ResourceSummaryRegistry from '@waldur/resource/summary/registry';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

import { ResourceSummaryBase } from './ResourceSummaryBase';

interface ResourceSummaryProps {
  resource: any;
  hasMultiSelect?: boolean;
  extraTabs?: Array<{
    title: ReactNode;
    eventKey: string | number;
    component: ComponentType;
  }>;
}

export const ResourceSummary: FunctionComponent<ResourceSummaryProps> = (
  props,
) => {
  const conf = ResourceSummaryRegistry.get(props.resource.resource_type);
  const SummaryComponent = conf?.component;

  const hasExtraTabs = Boolean(props.extraTabs?.length);

  if (conf?.standalone) {
    return (
      <ExpandableContainer hasMultiSelect={props.hasMultiSelect} asTable>
        <SummaryComponent resource={props.resource} />
      </ExpandableContainer>
    );
  } else {
    return (
      <ExpandableContainer
        hasMultiSelect={props.hasMultiSelect}
        asTable={!hasExtraTabs}
      >
        {!hasExtraTabs ? (
          <>
            <ResourceSummaryBase resource={props.resource} />
            {SummaryComponent && <SummaryComponent resource={props.resource} />}
          </>
        ) : (
          <Tab.Container defaultActiveKey="details" unmountOnExit={true}>
            <Nav variant="tabs" className="nav-line-tabs flex-nowrap mb-4">
              <Nav.Item>
                <Nav.Link eventKey="details">{translate('Details')}</Nav.Link>
              </Nav.Item>
              {props.extraTabs &&
                props.extraTabs.map((tab) => (
                  <Nav.Item key={tab.eventKey} className="text-nowrap">
                    <Nav.Link eventKey={tab.eventKey}>{tab.title}</Nav.Link>
                  </Nav.Item>
                ))}
            </Nav>
            <Tab.Content className="overflow-auto">
              <Tab.Pane eventKey="details" unmountOnExit={true}>
                <ResourceSummaryBase resource={props.resource} />
                {SummaryComponent && (
                  <SummaryComponent resource={props.resource} />
                )}
              </Tab.Pane>
              {props.extraTabs &&
                props.extraTabs.map((tab) => (
                  <Tab.Pane
                    key={tab.eventKey}
                    eventKey={tab.eventKey}
                    unmountOnExit={true}
                  >
                    <tab.component />
                  </Tab.Pane>
                ))}
            </Tab.Content>
          </Tab.Container>
        )}
      </ExpandableContainer>
    );
  }
};

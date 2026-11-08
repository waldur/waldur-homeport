import { ComponentType, FunctionComponent, ReactNode } from 'react';

import {
  PropertyList,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'waldur-ui';

import { translate } from '@/i18n';
import * as ResourceSummaryRegistry from '@/resource/summary/registry';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { ResourceSummaryBase } from './ResourceSummaryBase';

interface ResourceSummaryProps {
  resource: any;
  extraTabs?: Array<{
    title: ReactNode;
    eventKey: string;
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
      <ExpandableContainer asTable>
        <SummaryComponent resource={props.resource} />
      </ExpandableContainer>
    );
  } else {
    return (
      <ExpandableContainer asTable={!hasExtraTabs}>
        {!hasExtraTabs ? (
          <>
            <ResourceSummaryBase resource={props.resource} />
            {SummaryComponent && <SummaryComponent resource={props.resource} />}
          </>
        ) : (
          <Tabs mount="active" defaultValue="details">
            <TabsList className="mb-3">
              <TabsTrigger value="details">{translate('Details')}</TabsTrigger>
              {props.extraTabs &&
                props.extraTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.eventKey}

                    value={tab.eventKey}
                  >
                    {tab.title}
                  </TabsTrigger>
                ))}
            </TabsList>
            <div className="overflow-auto">
              <TabsContent value="details">
                <PropertyList variant="summary" hideIfEmpty={false}>
                  <ResourceSummaryBase resource={props.resource} />
                  {SummaryComponent && (
                    <SummaryComponent resource={props.resource} />
                  )}
                </PropertyList>
              </TabsContent>
              {props.extraTabs &&
                props.extraTabs.map((tab) => (
                  <TabsContent key={tab.eventKey} value={tab.eventKey}>
                    <tab.component />
                  </TabsContent>
                ))}
            </div>
          </Tabs>
        )}
      </ExpandableContainer>
    );
  }
};

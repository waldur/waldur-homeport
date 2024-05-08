import { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';

import { PageBarContext } from '@waldur/marketplace/context';
import {
  StepCardTabs,
  TabSpec,
} from '@waldur/marketplace/deploy/steps/StepCardTabs';

import { Resource } from '../types';

interface ResourceSpecGroupCardProps {
  tabs: TabSpec[];
  title: string;
  scope;
  resource: Resource;
  tabKey: string;
  index?: number;
  refetch?(): void;
  isLoading?: boolean;
}

export const ResourceSpecGroupCard: FunctionComponent<
  ResourceSpecGroupCardProps
> = (props) => {
  const [tab, setTab] = useState(props.tabs[0]);

  const { addTabs } = useContext(PageBarContext);
  useEffect(() => {
    addTabs([{ key: props.tabKey, title: props.title, priority: 11 }]);
  }, [props, addTabs]);

  return (
    <Card className="mb-10" id={props.tabKey}>
      <Card.Header>
        <Card.Title>
          <h3>{props.title}</h3>
        </Card.Title>
        <div className="card-toolbar flex-grow-1 ms-6">
          <StepCardTabs tabs={props.tabs} tab={tab} setTab={setTab} />
        </div>
      </Card.Header>
      <Card.Body className="p-0 min-h-550px">
        <tab.component
          resource={props.scope}
          marketplaceResource={props.resource}
          title={tab.title}
          initialPageSize={5}
          showPageSizeSelector
          refetch={props.refetch}
          isLoading={props.isLoading}
        />
      </Card.Body>
    </Card>
  );
};

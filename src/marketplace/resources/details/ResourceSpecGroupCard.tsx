import {
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Card } from 'react-bootstrap';

import { PageBarContext } from '@waldur/marketplace/context';
import { StepCardTabs } from '@waldur/marketplace/deploy/steps/StepCardTabs';
import { ResourceParentTab } from '@waldur/resource/tabs/types';

import { Resource } from '../types';

interface ResourceSpecGroupCardProps {
  specView: ResourceParentTab;
  scope;
  resource: Resource;
  index?: number;
}

export const ResourceSpecGroupCard: FunctionComponent<ResourceSpecGroupCardProps> =
  (props) => {
    const [tab, setTab] = useState(() => props.specView.children[0].key);

    const { addTabs } = useContext(PageBarContext);
    useEffect(() => {
      addTabs([
        {
          key: props.specView.key,
          title: props.specView.title,
        },
      ]);
    }, [props, addTabs]);

    const tabs = useMemo(
      () =>
        props.specView.children.map((spec) => ({
          label: spec.title,
          value: spec.key,
        })),
      [props.specView],
    );
    const view = useMemo(
      () => props.specView.children.find((spec) => spec.key === tab),
      [props.specView, tab],
    );

    return (
      <Card
        key={props.specView.title}
        className="mb-10"
        id={props.specView.key}
      >
        <Card.Header>
          <Card.Title>
            <h3>{props.specView.title}</h3>
          </Card.Title>
          <div className="card-toolbar flex-grow-1 ms-6">
            <StepCardTabs tabs={tabs} tab={tab} setTab={setTab} />
          </div>
        </Card.Header>
        <Card.Body className="p-0 min-h-550px">
          <view.component
            resource={props.scope}
            marketplaceResource={props.resource}
            title={view.title}
            initialPageSize={5}
            showPageSizeSelector
          />
        </Card.Body>
      </Card>
    );
  };

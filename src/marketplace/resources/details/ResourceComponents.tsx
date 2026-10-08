import { Col, Row } from 'react-bootstrap';
import { Resource, OfferingComponent } from 'waldur-js-client';

import { ResourceComponentItem } from './ResourceComponentItem';
import { ResourceShowMoreComponents } from './ResourceShowMoreComponents';

export const ResourceComponents = ({
  resource,
  components,
}: {
  resource: Pick<
    Resource,
    'name' | 'current_usages' | 'limits' | 'limit_usage'
  >;
  components: OfferingComponent[];
}) => {
  if (components.length <= 2) {
    return (
      <div className="d-flex flex-column gap-4">
        {components.map((component) => (
          <ResourceComponentItem
            key={component.type}
            expanded
            resource={resource}
            component={component}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <Row>
        {components.slice(0, 4).map((component) => (
          <Col key={component.type} xs={12} sm={6} md={12} xl={6}>
            <ResourceComponentItem resource={resource} component={component} />
          </Col>
        ))}
      </Row>
      {components?.length > 4 && (
        <div className="flex-grow-1 d-flex align-items-end mt-5">
          <ResourceShowMoreComponents
            resource={resource}
            components={components}
          />
        </div>
      )}
    </>
  );
};

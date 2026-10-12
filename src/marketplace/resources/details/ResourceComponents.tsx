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
      <Row className="gy-4">
        {components.map((component) => (
          <Col key={component.type} xs={12} sm={12 / components.length}>
            <ResourceComponentItem
              expanded
              stacked={components.length === 2}
              resource={resource}
              component={component}
            />
          </Col>
        ))}
      </Row>
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

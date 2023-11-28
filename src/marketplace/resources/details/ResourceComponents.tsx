import { Col, Row } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { Limits } from '@waldur/marketplace/common/registry';
import { OfferingComponent } from '@waldur/marketplace/types';

import { QuotaCell } from './QuotaCell';

const normalize = (value: number, factor: number) =>
  ((value || 0) / (factor || 1)).toFixed();

export const ResourceComponentItem = ({ component, resource }) => {
  return (
    <QuotaCell
      usage={
        component.billing_type === 'limit' && resource.limit_usage
          ? normalize(resource.limit_usage[component.type], component.factor)
          : normalize(resource.current_usages[component.type], component.factor)
      }
      limit={
        component.billing_type !== 'usage'
          ? normalize(resource.limits[component.type], component.factor)
          : null
      }
      title={component.name}
      description={component.description}
    />
  );
};

export const ResourceComponents = ({
  resource,
  components,
}: {
  resource: { current_usages: Limits; limits: Limits; limit_usage: Limits };
  components: OfferingComponent[];
}) => {
  const isSmallScreen = useMediaQuery({ maxWidth: 320 });

  return (
    <Row>
      {components.slice(0, 4).map((component) => (
        <Col
          key={component.type}
          xs={isSmallScreen ? 12 : 6}
          sm={6}
          md={12}
          xl={6}
        >
          <ResourceComponentItem resource={resource} component={component} />
        </Col>
      ))}
    </Row>
  );
};

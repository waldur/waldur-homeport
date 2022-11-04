import { Row } from 'react-bootstrap';

import { QuotaCell } from './QuotaCell';

export const ResourceComponents = ({ resource, components }) => (
  <Row>
    {components.map((component) => (
      <QuotaCell
        key={component.type}
        usage={resource.current_usages[component.type] || 0}
        limit={resource.limits[component.type]}
        units={component.measured_unit}
        title={component.name}
        description={component.description}
      />
    ))}
  </Row>
);

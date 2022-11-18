import { Table } from 'react-bootstrap';

import { Limits } from '@waldur/marketplace/common/registry';
import { OfferingComponent } from '@waldur/marketplace/types';

import { QuotaCell } from './QuotaCell';

export const ResourceComponents = ({
  resource,
  components,
}: {
  resource: { current_usages: Limits; limits: Limits };
  components: OfferingComponent[];
}) => {
  const normalize = (value: number, factor: number) =>
    ((value || 0) / (factor || 1)).toFixed();
  return (
    <Table className="gs-0 gy-1 gx-3">
      <tbody>
        {components.map((component) => (
          <QuotaCell
            key={component.type}
            usage={normalize(
              resource.current_usages[component.type],
              component.factor,
            )}
            limit={normalize(resource.limits[component.type], component.factor)}
            units={component.measured_unit}
            title={component.name}
            description={component.description}
          />
        ))}
      </tbody>
    </Table>
  );
};

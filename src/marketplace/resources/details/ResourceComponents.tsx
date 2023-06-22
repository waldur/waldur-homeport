import { Table } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { Limits } from '@waldur/marketplace/common/registry';
import { OfferingComponent } from '@waldur/marketplace/types';

import { QuotaCell } from './QuotaCell';

export const ResourceComponents = ({
  resource,
  components,
}: {
  resource: { current_usages: Limits; limits: Limits; limit_usage: Limits };
  components: OfferingComponent[];
}) => {
  const normalize = (value: number, factor: number) =>
    ((value || 0) / (factor || 1)).toFixed();

  const isMediumScreen = useMediaQuery({ minWidth: 768, maxWidth: 1270 });
  const isSmallScreen = useMediaQuery({ maxWidth: 320 });

  return (
    <Table className="gs-0 gy-1 gx-3">
      <tbody>
        {components.map((component) => (
          <QuotaCell
            key={component.type}
            usage={
              component.billing_type === 'limit' && resource.limit_usage
                ? normalize(
                    resource.limit_usage[component.type],
                    component.factor,
                  )
                : normalize(
                    resource.current_usages[component.type],
                    component.factor,
                  )
            }
            limit={normalize(resource.limits[component.type], component.factor)}
            units={component.measured_unit}
            title={component.name}
            description={component.description}
            compact={isMediumScreen || isSmallScreen}
          />
        ))}
      </tbody>
    </Table>
  );
};

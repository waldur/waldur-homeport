import { translate } from '@waldur/i18n';
import { Limits } from '@waldur/marketplace/common/registry';
import { OfferingComponent } from '@waldur/marketplace/types';

export const ShortResourceHeader = ({
  resource,
  components,
}: {
  resource: {
    name: string;
    customer_name: string;
    project_name: string;
    current_usages: Limits;
    limits: Limits;
  };
  components: OfferingComponent[];
}) => {
  const normalize = (value: number, factor: number) =>
    ((value || 0) / (factor || 1)).toFixed();
  const componentsList = components
    .map((component) =>
      translate('{usage} out of {limit} {unit} {name}', {
        usage: normalize(
          resource.current_usages[component.type],
          component.factor,
        ),
        limit: normalize(resource.limits[component.type], component.factor),
        unit: component.measured_unit,
        name: component.name,
      }),
    )
    .join(', ');
  return (
    <div
      style={{
        background: '#2f4050',
        padding: 10,
        display: 'flex',
        color: 'white',
      }}
    >
      <div style={{ flexGrow: 1 }}>{`${resource.name}: ${componentsList}`}</div>
      <div>{`${resource.customer_name} / ${resource.project_name}`}</div>
    </div>
  );
};

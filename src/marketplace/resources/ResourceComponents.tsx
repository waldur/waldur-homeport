import { Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { QuotaCell } from '@waldur/marketplace/resources/QuotaCell';

import { getOffering } from '../common/api';

export const ResourceComponents = ({ resource }) => {
  const { loading, error, value } = useAsync(() =>
    getOffering(resource.offering_uuid),
  );
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <p className="text-center">{translate('Unable to fetch offering.')}</p>
    );
  }

  return (
    <Row>
      {value.components.map((component) => (
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
};

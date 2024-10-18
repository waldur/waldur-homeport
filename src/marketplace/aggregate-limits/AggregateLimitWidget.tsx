import { useQuery } from '@tanstack/react-query';
import { Col, Row } from 'react-bootstrap';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { WidgetCard } from '@waldur/dashboard/WidgetCard';
import { translate } from '@waldur/i18n';
import { AggregateLimitsShowMoreButton } from '@waldur/marketplace/aggregate-limits/AggregateLimitsShowMoreButton';
import { QuotaCell } from '@waldur/marketplace/resources/details/QuotaCell';
import { Customer, Project } from '@waldur/workspace/types';

import { getProjectStats, getCustomerStats } from './api';

interface AggregateLimitWidgetProps {
  project?: Project;
  customer?: Customer;
}

export const ComponentItem = ({ component }) => {
  return (
    <QuotaCell
      usage={component.usage}
      limit={component.limit}
      title={component.name}
      description={component.description}
    />
  );
};

export const AggregateLimitWidget = ({
  project,
  customer,
}: AggregateLimitWidgetProps) => {
  const isProject = !!project;
  const uuid = isProject ? project.uuid : customer?.uuid;

  const { data, isLoading, error } = useQuery(
    [isProject ? 'project-stats' : 'customer-stats', uuid],
    () => (isProject ? getProjectStats(uuid) : getCustomerStats(uuid)),
    { refetchOnWindowFocus: false, staleTime: 60 * 1000 },
  );

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return (
      <>
        {translate(
          `Unable to load aggregate limits for this ${isProject ? 'project' : 'customer'}`,
        )}
      </>
    );
  }

  const components = data.data.components;

  return components?.length ? (
    <WidgetCard
      cardTitle={translate('Aggregate usage and limits')}
      className="h-100"
    >
      <Row className="field-row mb-1">
        {components.slice(0, 4).map((component) => (
          <Col key={component.type} xs={6}>
            <ComponentItem component={component} />
          </Col>
        ))}
      </Row>
      {components?.length > 4 && (
        <div className="flex-grow-1 d-flex align-items-end mt-5">
          <AggregateLimitsShowMoreButton components={components} />
        </div>
      )}
    </WidgetCard>
  ) : null;
};

import { Col, Row } from 'react-bootstrap';
import { Resource, OfferingComponent } from 'waldur-js-client';

import { ResourceDisplayLimits } from '../types';

import {
  getResourceComponentEntries,
  ResourceComponentItem,
} from './ResourceComponentItem';
import { ResourceShowMoreComponents } from './ResourceShowMoreComponents';

export const ResourceComponents = ({
  resource,
  components,
}: {
  resource: Pick<
    Resource,
    'name' | 'current_usages' | 'limits' | 'limit_usage'
  > &
    Partial<Pick<Resource, 'spending_limit_status'>> &
    ResourceDisplayLimits;
  components: OfferingComponent[];
}) => {
  const entries = getResourceComponentEntries(resource, components);
  if (entries.length <= 2) {
    return (
      <Row className="gy-4">
        {entries.map((entry) => (
          <Col key={entry.key} xs={12} sm={12 / entries.length}>
            <ResourceComponentItem
              expanded
              stacked={entries.length === 2}
              resource={resource}
              component={entry.component}
              spendingLimit={entry.spendingLimit}
              thisMonth={entry.thisMonth}
              noUsageThisMonth={entry.noUsageThisMonth}
            />
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <>
      <Row>
        {entries.slice(0, 4).map((entry) => (
          <Col key={entry.key} xs={12} sm={6} md={12} xl={6}>
            <ResourceComponentItem
              resource={resource}
              component={entry.component}
              spendingLimit={entry.spendingLimit}
              thisMonth={entry.thisMonth}
              noUsageThisMonth={entry.noUsageThisMonth}
            />
          </Col>
        ))}
      </Row>
      {entries.length > 4 && (
        <div className="grow flex items-end mt-5">
          <ResourceShowMoreComponents
            resource={resource}
            components={components}
          />
        </div>
      )}
    </>
  );
};

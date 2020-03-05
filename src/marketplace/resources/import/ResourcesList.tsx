import * as React from 'react';

import { translate } from '@waldur/i18n';

import { ResourceRow } from './ResourceRow';

export const ResourcesList = ({
  resources,
  offering,
  value,
  toggleResource,
  plans,
  assignPlan,
}) => (
  <table className="table">
    <thead>
      <tr>
        {resources.some(r => r.extra && r.extra.length > 0) && (
          <th>{/* Column for expand button */}</th>
        )}
        <th>{translate('Name')}</th>
        <th>{translate('Backend ID')}</th>
        <th>{translate('Actions')}</th>
        {offering.billable && <th className="col-sm-2">{translate('Plan')}</th>}
      </tr>
    </thead>
    <tbody>
      {resources.map((resource, index) => (
        <ResourceRow
          key={index}
          resource={resource}
          offering={offering}
          value={value}
          toggleResource={toggleResource}
          plans={plans}
          assignPlan={assignPlan}
        />
      ))}
    </tbody>
  </table>
);

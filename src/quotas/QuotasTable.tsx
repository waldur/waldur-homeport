import * as React from 'react';

import { translate } from '@waldur/i18n';

import './QuotasTable.scss';

import { formatQuotaValue, formatQuotaName } from './utils';

interface Quota {
  name: string;
  usage: number;
  limit: number;
}

interface Resource {
  quotas: Quota[];
}

export const QuotasTable = ({ resource }: { resource: Resource }) =>
  resource.quotas.length === 0 ? (
    <div className="row text-center">
      {translate('You have no quotas yet.')}
    </div>
  ) : (
    <div className="provider-quotas">
      {resource.quotas
        .sort((q1, q2) => q1.name.localeCompare(q2.name))
        .map(quota => (
          <div key={quota.name} className="details-table__row">
            <div className="details-table__key">
              {formatQuotaName(quota.name)}:
            </div>
            <div className="details-table__value">
              {translate('{usage} of {limit}', {
                usage: formatQuotaValue(quota.usage, quota.name),
                limit: formatQuotaValue(quota.limit, quota.name),
              })}
            </div>
          </div>
        ))}
    </div>
  );

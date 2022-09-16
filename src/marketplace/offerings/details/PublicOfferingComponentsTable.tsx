import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import './PublicOfferingComponentsTable.scss';

interface PublicOfferingComponentsTableProps {
  offering: Offering;
}

export const PublicOfferingComponentsTable: FunctionComponent<PublicOfferingComponentsTableProps> =
  ({ offering }) => {
    return (
      <table className="public-offering-components-table">
        <thead>
          <tr className="text-light bg-dark">
            <th>{translate('Name')}</th>
            <th>{translate('Unit')}</th>
            <th>{translate('Type')}</th>
            <th>{translate('Period')}</th>
            <th>{translate('Description')}</th>
          </tr>
        </thead>
        <tbody>
          {offering.components.map((component, i) => (
            <tr key={i}>
              <td>{component.name}</td>
              <td>{component.measured_unit}</td>
              <td>{component.billing_type}</td>
              <td>{component.limit_period ? component.limit_period : '—'}</td>
              <td>{component.description ? component.description : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

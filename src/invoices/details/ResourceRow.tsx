import { useBoolean } from 'react-use';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';

import { InvoiceItem } from '../types';

import { ComponentRow } from './ComponentRow';
import { ResourceHeader } from './ResourceHeader';

export const ResourceRow = ({ resource, customer, showPrice, showVat }) => {
  const [toggled, onToggle] = useBoolean(false);
  return (
    <>
      <tr onClick={onToggle}>
        <td colSpan={showPrice ? 5 : 6}>
          <ResourceHeader
            toggled={toggled}
            resource={resource}
            customer={customer}
          />
        </td>
        {showPrice && showVat && <td>{defaultCurrency(resource.total)}</td>}
        {showPrice && !showVat && <td>{defaultCurrency(resource.price)}</td>}
      </tr>
      {toggled && (
        <>
          {(resource.service_provider_name || resource.plan_name) && (
            <tr>
              <td colSpan={showPrice ? 5 : 6}>
                {resource.service_provider_name && (
                  <div>
                    <small>
                      {translate('Service provider')}:{' '}
                      {resource.service_provider_name}
                    </small>
                  </div>
                )}
                {resource.plan_name && (
                  <div>
                    <small>
                      {translate('Plan name')}: {resource.plan_name}
                    </small>
                  </div>
                )}
              </td>
            </tr>
          )}
          <tr>
            <th>
              {resource.items.length == 1
                ? translate('Name')
                : translate('Component name')}
            </th>
            <th>{translate('Unit')}</th>
            <th>{translate('Quantity')}</th>
            {showPrice && (
              <>
                <th>{translate('Unit price')}</th>
                {showVat && <th>{translate('Tax')}</th>}
                <th>{translate('Price')}</th>
              </>
            )}
          </tr>
          {resource.items.map((item: InvoiceItem, itemIndex: number) => (
            <ComponentRow
              key={itemIndex}
              item={item}
              showPrice={showPrice}
              showVat={showVat}
            />
          ))}
        </>
      )}
    </>
  );
};

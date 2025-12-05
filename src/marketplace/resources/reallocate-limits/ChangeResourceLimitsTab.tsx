import { FC, useMemo } from 'react';
import { Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { translate } from '@waldur/i18n';
import { Limits } from '@waldur/marketplace/common/types';

import { FetchedData } from '../change-limits/utils';

import { ComponentRow } from './ComponentRow';
import { ComponentTotalRow } from './ComponentTotalRow';
import { REALLOCATE_LIMITS_FORM_ID } from './constants';
import { calculateFreedCapacity } from './utils';

interface ChangeResourceLimitsTabProps {
  context: {
    asyncState: {
      value: FetchedData;
    };
  };
}

export const ChangeResourceLimitsTab: FC<ChangeResourceLimitsTabProps> = ({
  context,
}) => {
  const formSelector = formValueSelector(REALLOCATE_LIMITS_FORM_ID);
  const newLimits = useSelector((state) =>
    formSelector(state, 'limits'),
  ) as Limits;

  const {
    offering,
    plan,
    limits: currentLimits,
    usages,
    offeringLimits,
  } = context.asyncState.value;

  const components = useMemo(() => {
    if (!offering || !plan) return [];

    const limitComponents =
      offering.components?.filter((c) => c.billing_type === 'limit') || [];

    return limitComponents.map((component) => {
      const currentLimit = currentLimits[component.type] || 0;
      const newLimit = newLimits?.[component.type] ?? currentLimit;
      const changedLimit = newLimit - currentLimit;
      const usage = usages[component.type] || 0;

      return {
        type: component.type,
        name: component.name,
        measured_unit: component.measured_unit,
        is_boolean: component.is_boolean,
        usage,
        limit: currentLimit,
        changedLimit,
      };
    });
  }, [offering, plan, currentLimits, newLimits, usages]);

  const freedCapacity = useMemo(() => {
    if (!newLimits) return {};
    return calculateFreedCapacity(currentLimits, newLimits);
  }, [currentLimits, newLimits]);

  const freedCapacitySummary = Object.entries(freedCapacity)
    .map(([type, amount]) => {
      const component = components.find((c) => c.type === type);
      return component ? `${component.name}: ${amount}` : null;
    })
    .filter(Boolean)
    .join(' | ');

  return (
    <div>
      <p className="mb-4">
        <strong>{translate('Total freed')}</strong>{' '}
        {freedCapacitySummary && ` - ${freedCapacitySummary}`}
      </p>

      <div className="table-responsive">
        <Table className="table-row-bordered table-expandable align-middle table-rounded border border-gray-200">
          <thead>
            <tr>
              <th>{translate('Component')}</th>
              <th>{translate('Current limit')}</th>
              <th>{translate('New limit')}</th>
              <th>{translate('Change')}</th>
              <th>{translate('Price per month')}</th>
              <th>{translate('Price per year')}</th>
            </tr>
          </thead>
          <tbody>
            {components.map((component, index) => (
              <ComponentRow
                key={index}
                component={component}
                limits={offeringLimits[component.type]}
                offeringLimits={offeringLimits}
                plan={plan}
              />
            ))}
            <ComponentTotalRow components={components} plan={plan} />
          </tbody>
        </Table>
      </div>
    </div>
  );
};

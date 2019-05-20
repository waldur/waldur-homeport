import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';

import { FORM_ID } from '../store/constants';
import { getType, getComponents } from '../store/selectors';

const PureAccountingSummary = props => (props.formData && props.formData.plans) ? (
  <>
    <h3>{translate('Accounting')}</h3>
    {props.formData.plans.filter(plan => plan.name).map((plan, planIndex) => (
      <div key={planIndex}>
        <p>
          <strong>{translate('Plan name')}:</strong> {plan.name}
        </p>
        {(plan.quotas || plan.prices) && (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>{/* Name */}</th>
                <th>{translate('Amount')}</th>
                <th>{translate('Price')}</th>
                <th>{translate('Units')}</th>
              </tr>
            </thead>
            <tbody>
              {props.components.map((component: OfferingComponent, index) => (
                <tr key={index}>
                  <td>
                    {component.name}
                  </td>
                  <td>
                    {(plan.quotas && component.billing_type === 'fixed') ? plan.quotas[component.type] : 'N/A'}
                  </td>
                  <td>
                    {(plan.prices && plan.prices[component.type]) || 'N/A'}
                  </td>
                  <td>
                    {component.measured_unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    ))}
  </>
) : null;

const connector = connect(state => {
  const formData: any = getFormValues(FORM_ID)(state);
  const type = getType(state);
  const components = type && getComponents(state, type);
  return {formData, components};
});

export const AccountingSummary = connector(PureAccountingSummary);

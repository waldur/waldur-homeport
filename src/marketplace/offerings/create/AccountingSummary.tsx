import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';

import { FORM_ID } from '../store/constants';
import { getType, getComponents } from '../store/selectors';
import { hasError } from './utils';

const PureAccountingSummary = props => (
  <>
    <h3>{translate('Accounting')}</h3>
    {props.plansInvalid ? <p>{translate('Plans are invalid.')}</p> :
     props.componentsInvalid ? <p>{translate('Components are invalid.')}</p> :
     props.limitsInvalid ? <p>{translate('Limits are invalid.')}</p> : (
       <>
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
                        {(plan.prices && plan.prices[component.type] || plan.prices[component.type] === 0)
                              ? plan.prices[component.type]
                              : 'N/A'}
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
     )}
  </>
);

const connector = connect(state => {
  const formData: any = getFormValues(FORM_ID)(state);
  const type = getType(state);
  const components = type && getComponents(state, type);
  return {
    formData,
    components,
    plansInvalid: hasError('plans')(state),
    componentsInvalid: hasError('components')(state),
    limitsInvalid: hasError('limits')(state),
  };
});

export const AccountingSummary = connector(PureAccountingSummary);

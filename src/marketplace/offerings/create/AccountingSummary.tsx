import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';

import { FORM_ID } from '../store/constants';
import { getType, getComponents } from '../store/selectors';

import { PlanList } from './PlanList';
import { hasError } from './utils';

const PureAccountingSummary = props => {
  return (
    <>
      <h3>{translate('Accounting')}</h3>
      {props.plansInvalid ? (
        <p>{translate('Plans are invalid.')}</p>
      ) : props.componentsInvalid ? (
        <p>{translate('Components are invalid.')}</p>
      ) : props.limitsInvalid ? (
        <p>{translate('Limits are invalid.')}</p>
      ) : (
        <>
          <PlanList
            title={translate('Active plans')}
            plans={props.activePlans}
            components={props.components}
          />
          <PlanList
            title={translate('Archived plans')}
            plans={props.archivedPlans}
            components={props.components}
          />
        </>
      )}
    </>
  );
};

const connector = connect(state => {
  const formData: any = getFormValues(FORM_ID)(state);
  const type = getType(state);
  const components = type && getComponents(state, type);
  const activePlans = formData.plans
    ? formData.plans.filter(plan => !plan.archived)
    : [];
  const archivedPlans = formData.plans
    ? formData.plans.filter(plan => plan.archived)
    : [];
  return {
    formData,
    components,
    plansInvalid: hasError('plans')(state),
    componentsInvalid: hasError('components')(state),
    limitsInvalid: hasError('limits')(state),
    activePlans,
    archivedPlans,
  };
});

export const AccountingSummary = connector(PureAccountingSummary);

import * as React from 'react';
import { useMemo } from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';

import { FORM_ID } from '../store/constants';
import { getType, getComponents } from '../store/selectors';

import { PlanSummary } from './PlanSummary';
import { hasError } from './utils';

const PureAccountingSummary = props => {
  const activePlans = [];
  const archivedPlans = [];

  useMemo(() => {
    props.formData.plans
      .filter(plan => plan.name)
      .map((plan, planIndex) => {
        const p = (
          <PlanSummary
            key={planIndex}
            plan={plan}
            components={props.components}
          />
        );
        plan.archived ? archivedPlans.push(p) : activePlans.push(p);
      });
  }, [props]);

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
          <h4>{translate('Active plans')}</h4>
          {activePlans.map(p => p)}
          <h4>{translate('Archived plans')}</h4>
          {archivedPlans.map(p => p)}
        </>
      )}
    </>
  );
};

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

import { connect } from 'react-redux';
import { reset, formValueSelector } from 'redux-form';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { getOfferingComponents } from '@waldur/marketplace/common/registry';
import { showSuccess, showError } from '@waldur/store/coreSaga';

import { FORM_ID } from './constants';
import { setStep } from './store/actions';

const formatPlan = plan => {
  const result: any = {
    name: plan.name,
    unit: plan.unit.value,
    unit_price: plan.unit_price,
  };
  if (plan.components) {
    result.components = Object.keys(plan.components).map(key => ({
      type: key,
      amount: plan.components[key].amount,
      price: plan.components[key].price,
    }));
  }
  return result;
};

const formatOfferingRequest = (request, customer) => {
  const result = {
    ...request,
    category: request.category.url,
    customer: customer.url,
    type: request.type.value,
  };
  if (request.attributes) {
    result.attributes = request.attributes;
  }
  if (request.plans) {
    result.plans = request.plans.map(formatPlan);
  }
  return result;
};

export async function createOffering(props, request) {
  const { thumbnail, ...rest } = request;
  const params = formatOfferingRequest(rest, props.customer);
  try {
    const response = await api.createOffering(params);
    if (thumbnail) {
      const offeringId = response.data.uuid;
      await api.uploadOfferingThumbnail(offeringId, thumbnail);
    }
  } catch (error) {
    const errorMessage = `${translate('Unable to create offering.')} ${format(error)}`;
    props.dispatch(showError(errorMessage));
    return;
  }
  props.dispatch(reset(FORM_ID));
  props.dispatch(setStep('Describe'));
  props.dispatch(showSuccess(translate('Offering has been created.')));
  $state.go('marketplace-vendor-offerings');
}

const getTotalPrice = components =>
  Object.keys(components)
    .filter(item => components[item].amount && components[item].price)
    .reduce((result, item) => result + components[item].amount * components[item].price, 0);

export const connectPlanComponents = connect<any, any, {plan: string}>((state, ownProps) => {
  const selector = formValueSelector(FORM_ID);
  const type = selector(state, 'type');
  if (type) {
    const components = getOfferingComponents(type.value);
    const planData = selector(state, ownProps.plan);
    if (planData && planData.components) {
      const total = getTotalPrice(planData.components);
      return {components, total};
    } else {
      return {components, total: 0};
    }
  } else {
    return null;
  }
});

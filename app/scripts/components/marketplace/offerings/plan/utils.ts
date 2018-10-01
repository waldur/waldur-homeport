import { connect } from 'react-redux';

import { Component } from '@waldur/marketplace/details/plan/types';

import { getPlanPrice, getComponents, getType } from '../store/selectors';

interface ConnectedPlanStateProps {
  total: number;
  components: Component[];
}

export const connectPlanComponents = connect<ConnectedPlanStateProps, {}, {plan: string}>((state, ownProps) => {
  const total = getPlanPrice(state, ownProps.plan);
  const type = getType(state);
  const components = type ? getComponents(state, type) : undefined;
  return {total, components};
});

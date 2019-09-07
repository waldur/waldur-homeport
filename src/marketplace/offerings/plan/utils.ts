import { connect } from 'react-redux';

import { OfferingComponent } from '@waldur/marketplace/types';

import { getPlanPrice, getComponents, getType, getOfferingLimits } from '../store/selectors';

interface ConnectedPlanStateProps {
  total: number;
  components: OfferingComponent[];
  limits: string[];
}

export const connectPlanComponents = connect<ConnectedPlanStateProps, {}, {plan: string, archived?: boolean}>(
  (state, ownProps) => {
  const total = getPlanPrice(state, ownProps.plan);
  const type = getType(state);
  const components = type ? getComponents(state, type) : undefined;
  const limits = type ? getOfferingLimits(state, type) : undefined;
  return {total, components, limits};
});

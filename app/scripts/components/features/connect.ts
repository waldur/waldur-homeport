import { connect } from 'react-redux';

import { isVisible } from '@waldur/store/config';

export function withFeature(Component) {
  const mapStateToProps = (state) => ({
    isVisible: feature => isVisible(state, feature),
  });

  return connect(mapStateToProps)(Component);
}

export interface FeatureProps {
  isVisible: (feature: string) => boolean;
}

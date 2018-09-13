import { connect } from 'react-redux';

import { ComparisonTable } from '@waldur/marketplace/compare/ComparisonTable';
import { connectAngularComponent } from '@waldur/store/connect';

import { getItems } from './store/selectors';

const mapStateToProps = state => ({
  items: getItems(state),
});

const enhance = connect(mapStateToProps);

const MarketplaceComparison = enhance(ComparisonTable);

export default connectAngularComponent(MarketplaceComparison);

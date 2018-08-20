import { connect } from 'react-redux';

import { connectAngularComponent } from '@waldur/store/connect';

import { ComparisonTable } from './ComparisonTable';
import { getItems } from './store/selectors';

const mapStateToProps = state => ({
  sections: [],
  items: getItems(state),
});

const enhance = connect(mapStateToProps);

const MarketplaceComparison = enhance(ComparisonTable);

export default connectAngularComponent(MarketplaceComparison);

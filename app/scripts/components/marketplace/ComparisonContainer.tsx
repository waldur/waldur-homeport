import { connect } from 'react-redux';

import { getItems } from '@waldur/marketplace/store/selectors';
import { connectAngularComponent } from '@waldur/store/connect';

import { ComparisonTable } from './ComparisonTable';
import { sections } from './fixtures';

const mapStateToProps = state => ({
  sections,
  items: getItems(state),
});

const enhance = connect(mapStateToProps);

const MarketplaceComparison = enhance(ComparisonTable);

export default connectAngularComponent(MarketplaceComparison);

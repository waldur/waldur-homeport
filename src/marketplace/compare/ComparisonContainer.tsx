import { connect } from 'react-redux';

import { ComparisonTable } from '@waldur/marketplace/compare/ComparisonTable';

import { getItems } from './store/selectors';

const mapStateToProps = state => ({
  items: getItems(state),
});

const enhance = connect(mapStateToProps);

export const MarketplaceComparison = enhance(ComparisonTable);

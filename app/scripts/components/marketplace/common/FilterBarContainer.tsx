import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import { FilterBar } from '@waldur/marketplace/common/FilterBar';
import { setFilterQuery } from '@waldur/marketplace/offerings/store/actions';
import { connectAngularComponent } from '@waldur/store/connect';

import { selectFilterQuery } from '../offerings/store/selectors';

const mapStateToProps = state => ({
  filterQuery: selectFilterQuery(state),
});

const mapDispatchToProps = dispatch => ({
  setFilterQuery: query => dispatch(setFilterQuery(query)),
});

const enhance = compose(
  withTranslation,
  connect(mapStateToProps, mapDispatchToProps),
);

export const FilterBarContainer = enhance(FilterBar);

export default connectAngularComponent(FilterBarContainer);

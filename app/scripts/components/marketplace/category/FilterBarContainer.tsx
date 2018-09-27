import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import { setFilterQuery } from '@waldur/marketplace/offerings/store/actions';

import { selectFilterQuery } from '../offerings/store/selectors';
import { FilterBar } from './FilterBar';

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

import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';

import { setFilterQuery } from '../store/actions';
import { getFilterName } from '../store/selectors';
import { FilterBar } from './FilterBar';

const mapStateToProps = state => ({
  filterQuery: getFilterName(state),
});

const mapDispatchToProps = dispatch => ({
  setFilterQuery: query => dispatch(setFilterQuery(query)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation,
);

export const FilterBarContainer = enhance(FilterBar);

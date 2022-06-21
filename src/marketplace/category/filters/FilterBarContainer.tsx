import { connect } from 'react-redux';

import { RootState } from '@waldur/store/reducers';

import { setFilterQuery } from '../store/actions';
import { getFilterName } from '../store/selectors';

import { FilterBar } from './FilterBar';

const mapStateToProps = (state: RootState) => ({
  filterQuery: getFilterName(state),
});

const mapDispatchToProps = (dispatch) => ({
  setFilterQuery: (query) => dispatch(setFilterQuery(query)),
});

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const FilterBarContainer = enhance(FilterBar);

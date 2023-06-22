import { connect } from 'react-redux';

import { RootState } from '@waldur/store/reducers';

import { categoryChanged } from '../store/actions';
import { getCategory, getCategories } from '../store/selectors';

import { DescriptionStep } from './DescriptionStep';

const mapStateToProps = (state: RootState) => ({
  category: getCategory(state),
  categories: getCategories(state),
});

const mapDispatchToProps = (dispatch) => ({
  onCategoryChange: (category) => dispatch(categoryChanged(category)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export const DescriptionStepContainer = connector(DescriptionStep);

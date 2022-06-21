import { connect } from 'react-redux';

import { DescriptionStep } from '@waldur/marketplace/offerings/create/DescriptionStep';
import * as actions from '@waldur/marketplace/offerings/store/actions';

import { getCategory, getCategories } from '../store/selectors';

const mapStateToProps = (state) => ({
  category: getCategory(state),
  categories: getCategories(state),
});

const mapDispatchToProps = (dispatch) => ({
  onCategoryChange: (category) => dispatch(actions.categoryChanged(category)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export const DescriptionUpdateContainer = connector((props) => {
  return <DescriptionStep {...props} layout="vertical" />;
});

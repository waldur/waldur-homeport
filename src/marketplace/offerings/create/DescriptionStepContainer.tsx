import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';

import { categoryChanged } from '../store/actions';
import { getCategory, getCategories } from '../store/selectors';
import { DescriptionStep } from './DescriptionStep';

const mapStateToProps = state => ({
  category: getCategory(state),
  categories: getCategories(state),
});

const mapDispatchToProps = {
  onCategoryChange: categoryChanged,
};

const connector = compose(withTranslation, connect(mapStateToProps, mapDispatchToProps));

export const DescriptionStepContainer = connector(DescriptionStep);

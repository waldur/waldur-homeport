import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { MARKETPLACE_FILTER_FORM } from '../store/constants';
import * as selectors from '../store/selectors';
import { AttributeFilterList } from './AttributeFilterList';

const connector = connect(state => ({
  loading: selectors.isLoading(state),
  loaded: selectors.isLoaded(state),
  erred: selectors.isErred(state),
  sections: selectors.getSections(state),
}));

const form = reduxForm({
  form: MARKETPLACE_FILTER_FORM,
  destroyOnUnmount: false,
});

const enhance = compose(form, connector);

export const AttributeFilterListContainer = enhance(AttributeFilterList);

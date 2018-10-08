import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { connectAngularComponent } from '@waldur/store/connect';

import { loadDataStart } from '../store/actions';
import { FORM_ID, createOffering } from '../store/constants';
import { getStep, isLoading, isLoaded } from '../store/selectors';
import { OfferingCreateDialog } from './OfferingCreateDialog';

const mapStateToProps = state => ({
  step: getStep(state),
  loading: isLoading(state),
  loaded: isLoaded(state),
});

const mapDispatchToProps = dispatch => ({
  createOffering: data => createOffering(data, dispatch),
  loadData: () => dispatch(loadDataStart()),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
    destroyOnUnmount: false,
  }),
);

const OfferingCreateContainer = enhance(OfferingCreateDialog);

export default connectAngularComponent(OfferingCreateContainer);

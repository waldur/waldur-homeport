import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, formValues } from 'redux-form';

import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import * as actions from './actions';
import { ProviderCreateForm } from './ProviderCreateForm';
import * as ProvidersRegistry from './registry';

const mapStateToProps = state => {
  const types = ProvidersRegistry.getEnabledProviders(state);
  return {
    types,
    initialValues: {
      type: types[0],
    },
  };
};

const mapDispatchToProps = dispatch => ({
  createProvider: data => actions.createProvider(data, dispatch),
  onCancel: () => actions.gotoProvidersList(null, dispatch),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({form: 'providerCreate'}),
  formValues('type'),
  withTranslation,
);

const ProviderCreateContainer = enhance(ProviderCreateForm);

export default connectAngularComponent(ProviderCreateContainer);

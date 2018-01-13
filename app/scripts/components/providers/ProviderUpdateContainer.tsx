import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import * as actions from './actions';
import { ProviderUpdateComponent } from './ProviderUpdateComponent';
import { getProviderUpdateState } from './reducers';
import * as ProvidersRegistry from './registry';

const mapStateToProps = (state, ownProps) => {
  const type = ProvidersRegistry.findProvider(ownProps.provider.service_type);
  const {provider, loaded, erred} = getProviderUpdateState(state);
  const initialValues = {...provider, type};

  let editable = false;
  // User can update settings only if he is an owner of their customer or a staff
  if (provider) {
    const user = getUser(state);
    const customer = getCustomer(state);
    const isOwner = customer.owners.find(owner => owner.uuid === user.uuid) !== undefined;
    editable = (!provider.customer && user.is_staff) || isOwner;
  }

  return {
    loaded,
    erred,
    provider,
    type,
    initialValues,
    editable,
    defaultErrorMessage: ownProps.translate(state.config.defaultErrorMessage),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchProvider: () => dispatch(actions.fetchProviderRequest(ownProps.provider.settings_uuid)),
  updateProvider: data => actions.updateProvider(data, dispatch),
});

const enhance = compose(
  withTranslation,
  connect(mapStateToProps, mapDispatchToProps),
);

export const ProviderUpdateContainer = enhance(ProviderUpdateComponent);

export default connectAngularComponent(ProviderUpdateContainer, ['provider']);

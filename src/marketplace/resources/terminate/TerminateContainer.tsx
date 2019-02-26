import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { orderCanBeApproved } from '@waldur/marketplace/orders/store/selectors';
import { connectAngularComponent } from '@waldur/store/connect';

import { terminateResource } from '../store/constants';
import { PureTerminateDialog } from './TerminateDialog';

const mapStateToProps = state => ({
  orderCanBeApproved: orderCanBeApproved(state),
});

const mapDispatchToProps = (dispatch, ownProps: any) => ({
  submitRequest: () => terminateResource({
    marketplace_resource_uuid: ownProps.resolve.resource.marketplace_resource_uuid,
    resource_uuid: ownProps.resolve.resource.uuid,
    resource_type: ownProps.resolve.resource.resource_type,
  }, dispatch),
});

const connector = compose(
  reduxForm({form: 'TerminateResourceDialog'}),
  connect(mapStateToProps, mapDispatchToProps),
);

const TerminateDialog = connector(PureTerminateDialog);

export default connectAngularComponent(TerminateDialog, ['resolve']);

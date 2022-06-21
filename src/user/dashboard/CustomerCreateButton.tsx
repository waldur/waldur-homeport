import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { customerCreateDialog } from '@waldur/customer/create/actions';
import { canCreateOrganization } from '@waldur/customer/create/selectors';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { ActionButton } from '@waldur/table/ActionButton';

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = typeof mapDispatchToProps;

const CustomerCreateButton: FunctionComponent<StateProps & DispatchProps> = ({
  isVisible,
  onClick,
}) =>
  isVisible ? (
    <ActionButton
      title={translate('Add organization')}
      action={onClick}
      icon="fa fa-plus"
      variant="primary"
    />
  ) : null;

const mapDispatchToProps = {
  onClick: customerCreateDialog,
};

const mapStateToProps = (state: RootState) => ({
  isVisible: canCreateOrganization(state),
});

const enhance = connect(mapStateToProps, mapDispatchToProps);

export default enhance(CustomerCreateButton);

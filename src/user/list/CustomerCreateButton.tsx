import { connect } from 'react-redux';
import { compose } from 'redux';

import { customerCreateDialog } from '@waldur/customer/create/actions';
import { canCreateOrganization } from '@waldur/customer/create/selectors';
import { withTranslation } from '@waldur/i18n/translate';
import { ActionButton } from '@waldur/table/ActionButton';
import { OuterState } from '@waldur/workspace/types';

const CustomerCreateButton = ({ isVisible, onClick, translate }) =>
  isVisible ? (
    <ActionButton
      title={translate('Add organization')}
      action={onClick}
      icon="fa fa-plus"
    />
  ) : null;

const enhance = compose(
  connect(
    (state: OuterState) => ({
      isVisible: canCreateOrganization(state),
    }),
    {
      onClick: customerCreateDialog,
    },
  ),
  withTranslation,
);

export default enhance(CustomerCreateButton);

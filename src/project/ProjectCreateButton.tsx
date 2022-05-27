import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n/translate';
import { RootState } from '@waldur/store/reducers';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, isOwnerOrStaff } from '@waldur/workspace/selectors';

import { gotoProjectCreate } from './actions';

const PureProjectCreateButton: FunctionComponent<any> = (props) => (
  <ActionButton
    title={translate('Add project')}
    action={props.gotoProjectCreate}
    tooltip={props.tooltip}
    icon="fa fa-plus"
    variant="primary"
    disabled={props.disabled}
  />
);

const mapStateToProps = (state: RootState) => {
  const ownerOrStaff = isOwnerOrStaff(state);
  const customer = getCustomer(state);

  if (!ownerOrStaff || !customer) {
    return {
      disabled: true,
      tooltip: translate(
        "You don't have enough privileges to perform this operation.",
      ),
    };
  } else {
    return {
      disabled: false,
    };
  }
};

const enhance = connect(mapStateToProps, { gotoProjectCreate });

export const ProjectCreateButton = enhance(PureProjectCreateButton);

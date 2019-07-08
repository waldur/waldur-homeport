import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { getCustomer } from '@waldur/workspace/selectors';

const getSettingsUUID = (_, props) => props.offering.scope_uuid;

const makeGetVariable = () => {
  return createSelector(
    [ getCustomer, getSettingsUUID ],
    (customer, settingsUUID) => ({
      customer_uuid: customer.uuid,
      settings_uuid: settingsUUID,
    }),
  );
};

const makeMapStateToProps = () => {
  const getVariable = makeGetVariable();
  const mapStateToProps = (state, props) => {
    return {
      variable: getVariable(state, props),
    };
  };
  return mapStateToProps;
};

export const connector = connect(makeMapStateToProps);

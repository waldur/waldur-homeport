import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { formValueSelector, reduxForm } from 'redux-form';
import {
  DirectionEnum,
  EthertypeEnum,
  OpenStackSecurityGroup,
  openstackSecurityGroupsList,
  openstackSecurityGroupsSetRules,
  ProtocolEnum,
} from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { type RootState } from '@waldur/store/reducers';

import { SecurityGroupRulesFormData, Rule } from './types';

export const getPortMax = (rule: Rule) => {
  if (rule.protocol === 'any' || !rule.protocol) {
    return -1;
  } else if (rule.protocol === 'icmp') {
    return 255;
  } else {
    return 65535;
  }
};

const FORM_NAME = 'securityGroupRuleEdit';

export const getRuleSelector =
  (formName: string, name: string) => (state: RootState) =>
    formValueSelector(formName)(state, name) as Rule;

type OwnProps = ReturnType<typeof useRulesEditor>;

export const connectForm = reduxForm<SecurityGroupRulesFormData, OwnProps>({
  form: FORM_NAME,
});

export const useRulesEditor = (resource: OpenStackSecurityGroup) => {
  const tenant =
    resource.resource_type === 'OpenStack.Tenant'
      ? resource.url
      : resource.tenant;
  const asyncState = useAsync(
    () =>
      getAllPages((page) =>
        openstackSecurityGroupsList({
          query: { page, tenant, field: ['name', 'url'] },
        }),
      ),
    [tenant],
  );
  const dispatch = useDispatch();
  const submitRequest = async (formData: SecurityGroupRulesFormData) => {
    try {
      await openstackSecurityGroupsSetRules({
        path: { uuid: resource.uuid },
        body: serializeRulesPayload(formData),
      });
      dispatch(
        showSuccess(
          translate('Security group rules update has been scheduled.'),
        ),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to update security group rules.'),
        ),
      );
    }
  };
  return {
    asyncState,
    submitRequest,
    resource,
    initialValues: {
      rules: resource.rules.map(({ from_port, to_port, ...rest }) => ({
        ...rest,
        port_range: {
          min: from_port,
          max: to_port,
        },
      })),
    },
  };
};

export const serializeRulesPayload = (formData: SecurityGroupRulesFormData) =>
  formData.rules.map(
    ({ protocol, port_range, ethertype, direction, ...rest }) => ({
      ...rest,
      ethertype: ethertype as EthertypeEnum,
      direction: direction as DirectionEnum,
      protocol: (protocol === 'any' ? '' : protocol) as ProtocolEnum,
      from_port: port_range.min,
      to_port: port_range.max,
    }),
  );

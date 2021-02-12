import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { formValueSelector, reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  loadSecurityGroupsResources,
  setSecurityGroupRules,
} from '@waldur/openstack/api';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

import { SecurityGroup } from '../types';

import { FormData, Rule } from './types';

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

export const getRuleSelector = (formName: string, name: string) => (
  state: RootState,
) => formValueSelector(formName)(state, name) as Rule;

type OwnProps = ReturnType<typeof useRulesEditor>;

export const connectForm = reduxForm<FormData, OwnProps>({ form: FORM_NAME });

export const useRulesEditor = (resource: SecurityGroup) => {
  const tenant =
    resource.resource_type === 'OpenStack.Tenant'
      ? resource.url
      : resource.tenant;
  const asyncState = useAsync(
    () =>
      loadSecurityGroupsResources({
        tenant,
        field: ['name', 'url'],
        o: 'name',
      }),
    [tenant],
  );
  const dispatch = useDispatch();
  const submitRequest = async (formData: FormData) => {
    try {
      await setSecurityGroupRules(
        resource.uuid,
        formData.rules.map((rule) => ({
          ...rule,
          protocol: rule.protocol === 'any' ? '' : rule.protocol,
        })),
      );
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
    initialValues: { rules: resource.rules },
  };
};

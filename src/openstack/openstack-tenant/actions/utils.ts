import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  loadSecurityGroupsResources,
  loadServerGroupsResources,
  createSecurityGroup,
  createServerGroup,
  CreateSecurityGroupRequestBody,
  CreateServerGroupRequestBody,
} from '@waldur/openstack/api';
import { ActionContext } from '@waldur/resource/actions/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { OpenStackTenant } from '../types';

export function userCanModifyTenant(ctx: ActionContext): string {
  if (
    ENV.plugins.WALDUR_CORE.ONLY_STAFF_MANAGES_SERVICES &&
    !ctx.user.is_staff
  ) {
    return translate('Only staff can manage OpenStack tenant.');
  }
}

type CreateSecurityGroupFormData = CreateSecurityGroupRequestBody;

export const useCreateSecurityGroupForm = (resource: OpenStackTenant) => {
  const asyncState = useAsync(
    () =>
      loadSecurityGroupsResources({
        tenant: resource.url,
        field: ['name', 'url'],
        o: 'name',
      }),
    [resource.url],
  );
  const dispatch = useDispatch();
  const submitRequest = async (formData: CreateSecurityGroupFormData) => {
    try {
      await createSecurityGroup(resource.uuid, {
        ...formData,
        rules:
          formData.rules === undefined
            ? []
            : formData.rules.map(({ port_range, ...rule }) => ({
                ...rule,
                protocol: rule.protocol === null ? '' : rule.protocol,
                from_port: port_range.min,
                to_port: port_range.max,
              })),
      });
      dispatch(
        showSuccess(translate('Security group creation has been scheduled.')),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to create security group.')),
      );
    }
  };
  return { asyncState, submitRequest, resource };
};

const FORM_NAME = 'CreateSecurityGroupForm';

type OwnProps = ReturnType<typeof useCreateSecurityGroupForm>;

export const connectForm = reduxForm<CreateSecurityGroupFormData, OwnProps>({
  form: FORM_NAME,
});

/////////////////////////////
type CreateServerGroupFormData = CreateServerGroupRequestBody;

export const useCreateServerGroupForm = (resource: OpenStackTenant) => {
  const asyncState = useAsync(
    () =>
      loadServerGroupsResources({
        tenant: resource.url,
        field: ['name', 'url'],
        o: 'name',
      }),
    [resource.url],
  );
  const dispatch = useDispatch();
  const submitRequest = async (formData: CreateServerGroupFormData) => {
    try {
      await createServerGroup(resource.uuid, {
        ...formData,
        policy: formData.policy['value'],
      });
      dispatch(
        showSuccess(translate('Server group creation has been scheduled.')),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to create server group.')),
      );
    }
  };
  return { asyncState, submitRequest, resource };
};

const SERVER_GROUP_FORM_NAME = 'CreateServerGroupForm';

type ServerGroupOwnProps = ReturnType<typeof useCreateServerGroupForm>;

export const connectServerGroupForm = reduxForm<
  CreateServerGroupFormData,
  ServerGroupOwnProps
>({
  form: SERVER_GROUP_FORM_NAME,
});

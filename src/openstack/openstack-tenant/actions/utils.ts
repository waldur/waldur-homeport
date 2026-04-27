import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';
import {
  OpenStackServerGroupRequest,
  openstackSecurityGroupsList,
  openstackServerGroupsList,
  openstackTenantsCreateSecurityGroup,
  openstackTenantsCreateServerGroup,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import {
  EthernetType,
  SecurityGroupDirection,
  SecurityGroupProtocol,
} from '@/openstack/types';
import { ActionContext } from '@/resource/actions/types';
import { showErrorResponse, showSuccess } from '@/store/notify';

import { OpenStackTenant } from '../types';

interface CreateSecurityGroupRuleRequestBody {
  ethertype: EthernetType;
  direction: SecurityGroupDirection;
  protocol: SecurityGroupProtocol;
  from_port: number;
  to_port: number;
  port_range?: { min: number; max: number };
  cidr: string;
  remote_group?: string;
  description?: string;
}

interface CreateSecurityGroupFormData {
  name: string;
  description?: string;
  rules: CreateSecurityGroupRuleRequestBody[];
}

export function userCanModifyTenant(ctx: ActionContext): string {
  if (
    ENV.plugins.WALDUR_CORE.ONLY_STAFF_MANAGES_SERVICES &&
    !ctx.user.is_staff
  ) {
    return translate('Only staff can manage OpenStack tenant.');
  }
}

export const useCreateSecurityGroupForm = (
  resource: OpenStackTenant,
  refetch,
) => {
  const asyncState = useAsync(
    () =>
      getAllPages((page) =>
        openstackSecurityGroupsList({
          query: { page, tenant: resource.url, field: ['name', 'url'] },
        }),
      ),
    [resource.url],
  );
  const dispatch = useDispatch();
  const submitRequest = async (formData: CreateSecurityGroupFormData) => {
    try {
      await openstackTenantsCreateSecurityGroup({
        path: { uuid: resource.uuid },
        body: {
          ...formData,
          rules:
            formData.rules === undefined
              ? []
              : formData.rules.map(({ port_range, ...rule }) => ({
                  ...rule,
                  protocol:
                    rule.protocol === 'any' || rule.protocol === null
                      ? ''
                      : rule.protocol,
                  from_port: port_range.min,
                  to_port: port_range.max,
                })),
        },
      });
      await refetch();
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
export const useCreateServerGroupForm = (
  resource: OpenStackTenant,
  refetch?,
) => {
  const asyncState = useAsync(
    () =>
      getAllPages((page) =>
        openstackServerGroupsList({
          query: {
            page,
            tenant: resource.url,
            field: ['name', 'url'],
          },
        }),
      ),
    [resource.url],
  );
  const dispatch = useDispatch();
  const submitRequest = async (formData: OpenStackServerGroupRequest) => {
    try {
      await openstackTenantsCreateServerGroup({
        path: { uuid: resource.uuid },
        body: {
          ...formData,
          policy: formData.policy['value'],
        },
      });
      if (refetch) {
        await refetch();
      }
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
  OpenStackServerGroupRequest,
  ServerGroupOwnProps
>({
  form: SERVER_GROUP_FORM_NAME,
});

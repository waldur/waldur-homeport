import { useQuery } from '@tanstack/react-query';
import { Form } from 'react-bootstrap';
import { Field, FieldArray, reduxForm } from 'redux-form';
import {
  openstackSecurityGroupsList,
  openstackTenantsCreateSecurityGroup,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { getLatinNameValidators } from '@/core/validators';
import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RulesList } from '@/openstack/openstack-security-groups/rule-editor/RulesList';
import {
  type EthernetType,
  type SecurityGroupDirection,
  type SecurityGroupProtocol,
} from '@/openstack/types';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';

import { TenantActionProps } from './types';

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

const FORM_NAME = 'CreateSecurityGroupForm';

interface CreateSecurityGroupDialogProps {
  resolve: TenantActionProps;
}

export const CreateSecurityGroupDialog = reduxForm<
  CreateSecurityGroupFormData,
  CreateSecurityGroupDialogProps
>({
  form: FORM_NAME,
})(({ handleSubmit, submitting, invalid, resolve: { resource, refetch } }) => {
  const {
    data: securityGroups,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['openstack-security-groups', resource.url],
    queryFn: () =>
      getAllPages((page) =>
        openstackSecurityGroupsList({
          query: { page, tenant: resource.url, field: ['name', 'url'] },
        }),
      ),
  });

  const submitMutation = useManagedMutation<
    any,
    any,
    CreateSecurityGroupFormData
  >({
    mutationFn: (formData) =>
      openstackTenantsCreateSecurityGroup({
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
      }),
    successMessage: translate('Security group creation has been scheduled.'),
    errorMessage: translate('Unable to create security group.'),
    refetch,
  });

  return (
    <form
      onSubmit={handleSubmit((values) => submitMutation.mutateAsync(values))}
    >
      <AsyncActionDialog
        title={translate('Create security group for OpenStack tenant {name}', {
          name: resource.name,
        })}
        loading={isLoading}
        error={error}
        submitting={submitting}
        invalid={invalid}
      >
        {securityGroups ? (
          <>
            <Form.Group>
              <Form.Label>{translate('Name')}</Form.Label>
              <Field
                component={InputField}
                name="name"
                validate={getLatinNameValidators()}
                maxLength={150}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>{translate('Description')}</Form.Label>
              <Field
                component={InputField}
                name="description"
                maxLength={4096}
              />
            </Form.Group>

            <FieldArray
              name="rules"
              component={RulesList}
              remoteSecurityGroups={securityGroups}
            />
          </>
        ) : null}
      </AsyncActionDialog>
    </form>
  );
});

import { useQuery } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { Field, Form as FinalForm } from 'react-final-form';
import {
  openstackSecurityGroupsList,
  openstackTenantsCreateSecurityGroup,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { composeValidators, getLatinNameValidators } from '@/core/validators';
import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RulesList } from '@/openstack/openstack-security-groups/rule-editor/RulesList';
import { Rule } from '@/openstack/openstack-security-groups/rule-editor/types';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';

import { TenantActionProps } from './types';

interface CreateSecurityGroupFormData {
  name: string;
  description?: string;
  rules: Rule[];
}

interface CreateSecurityGroupDialogProps {
  resolve: TenantActionProps;
}

export const CreateSecurityGroupDialog: FC<CreateSecurityGroupDialogProps> = ({
  resolve: { resource, refetch },
}) => {
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

  const { mutateAsync } = useManagedMutation<
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
                  protocol: (rule.protocol === 'any' || rule.protocol === null
                    ? ''
                    : rule.protocol) as any,

                  direction: rule.direction as any,
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
    <FinalForm<CreateSecurityGroupFormData>
      onSubmit={mutateAsync}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <AsyncActionDialog
            title={translate(
              'Create security group for OpenStack tenant {name}',
              {
                name: resource.name,
              },
            )}
            loading={isLoading}
            error={error}
            submitting={submitting}
            invalid={invalid}
          >
            {securityGroups ? (
              <>
                <Form.Group>
                  <Form.Label htmlFor="create-sg-name">
                    {translate('Name')}
                  </Form.Label>
                  <Field
                    id="create-sg-name"
                    component={InputField}
                    name="name"
                    validate={composeValidators(...getLatinNameValidators())}
                    maxLength={150}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label htmlFor="create-sg-description">
                    {translate('Description')}
                  </Form.Label>
                  <Field
                    id="create-sg-description"
                    component={InputField}
                    name="description"
                    maxLength={4096}
                  />
                </Form.Group>

                <RulesList remoteSecurityGroups={securityGroups} />
              </>
            ) : null}
          </AsyncActionDialog>
        </form>
      )}
    />
  );
};

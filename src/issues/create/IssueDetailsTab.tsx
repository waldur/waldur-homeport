import { useCallback, useEffect } from 'react';
import { Alert, Form, Stack } from 'react-bootstrap';
import { Field, useFormState, useForm } from 'react-final-form';

import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { ProjectGroup } from '@/issues/create/ProjectGroup';
import { useUser } from '@/workspace/hooks';

import { IssueTypeChoice } from '../types/constants';

import { OrganizationGroup } from './OrganizationGroup';
import { ResourceGroup } from './ResourceGroup';
import { TypeField } from './TypeField';

interface IssueDetailsTabContext {
  scope?: any;
  scopeType?: string;
  issueTypes: IssueTypeChoice[];
  isLoading: boolean;
  error: unknown;
}

export const IssueDetailsTab = ({
  context,
}: {
  context: IssueDetailsTabContext;
}) => {
  const form = useForm();
  const { values, submitting } = useFormState();
  const standaloneIssue = values.standaloneIssue;
  const type = values.type;

  const user = useUser();
  const isStaffOrSupport = user?.is_staff || user?.is_support;

  // Get request types data from context (fetched in IssueCreateForm)
  const { issueTypes, isLoading, error } = context;

  const setValue = useCallback(
    (field, value) => form.change(field, value),
    [form],
  );

  // Set default type to first available type when types are loaded
  useEffect(() => {
    if (!type && issueTypes.length > 0) {
      setValue('type', issueTypes[0]);
    }
  }, [setValue, type, issueTypes]);

  // Set context values on mount
  useEffect(() => {
    const scope = context.scope;

    if (context.scopeType === 'customer') {
      setValue('customer', scope);
    } else if (context.scopeType === 'project') {
      setValue('customer', {
        name: scope.customer_name,
        uuid: scope.customer_uuid,
        url: scope.customer,
      });
      setValue('project', {
        name: scope.name,
        uuid: scope.uuid,
        url: scope.url,
        customer_uuid: scope.customer_uuid,
      });
    } else if (context.scopeType === 'resource') {
      setValue('customer', {
        name: scope.customer_name,
        uuid: scope.customer_uuid,
        url: scope.customer,
      });
      setValue('project', {
        name: scope.project_name,
        uuid: scope.project_uuid,
        url: scope.project,
        customer_uuid: scope.customer_uuid,
      });
      setValue('resource', {
        name: scope.name,
        uuid: scope.uuid,
        url: scope.url,
        project_uuid: scope.project_uuid,
        offering_name: scope.offering_name,
      });
    }
  }, [context, setValue]);

  // Clear context when standalone issue is checked
  useEffect(() => {
    if (standaloneIssue) {
      setValue('customer', undefined);
      setValue('project', undefined);
      setValue('resource', undefined);
    }
  }, [standaloneIssue, setValue]);

  // Show loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Show error if no request types available
  if (error || issueTypes.length === 0) {
    return (
      <Alert variant="warning">
        <Alert.Heading>
          {translate('Service desk configuration incomplete')}
        </Alert.Heading>
        <p>
          {translate(
            'Unable to create support request. No request types are available.',
          )}
        </p>
        {isStaffOrSupport && (
          <p className="mb-0 text-muted">
            <small>
              {translate('Staff info: No active RequestTypes found.')}
            </small>
          </p>
        )}
      </Alert>
    );
  }

  // Show type selector only when there are multiple types
  const showTypeSelector =
    ENV.plugins.WALDUR_SUPPORT?.DISPLAY_REQUEST_TYPE && issueTypes.length > 1;

  return (
    <>
      {showTypeSelector && (
        <TypeField issueTypes={issueTypes} isDisabled={submitting} />
      )}
      <Form.Group className="mb-5">
        <Field
          name="standaloneIssue"
          type="checkbox"
          component={AwesomeCheckboxField}
          label={translate(
            'Issue is general and not tied to any specific organization, project, or resource',
          )}
          disabled={['customer', 'project', 'resource'].includes(
            context.scopeType,
          )}
        />
      </Form.Group>
      <Stack direction="horizontal" gap={3}>
        <OrganizationGroup
          disabled={
            standaloneIssue ||
            ['customer', 'project', 'resource'].includes(context.scopeType)
          }
        />

        <ProjectGroup
          disabled={
            standaloneIssue ||
            ['project', 'resource'].includes(context.scopeType)
          }
        />
      </Stack>
      <ResourceGroup
        disabled={standaloneIssue || context.scopeType === 'resource'}
      />
    </>
  );
};

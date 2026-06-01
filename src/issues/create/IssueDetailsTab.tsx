import { useEffect } from 'react';
import { Alert, Stack } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';

import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { BooleanGroup } from '@/form';
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
  const { change } = useForm();
  const { values, submitting } = useFormState();
  const standaloneIssue = values.standaloneIssue;
  const type = values.type;

  const user = useUser();
  const isStaffOrSupport = user?.is_staff || user?.is_support;

  // Get request types data from context (fetched in IssueCreateForm)
  const { issueTypes, isLoading, error } = context;

  // Set default type to first available type when types are loaded
  useEffect(() => {
    if (!type && issueTypes.length > 0) {
      change('type', issueTypes[0]);
    }
  }, [change, type, issueTypes]);

  // Set context values on mount
  useEffect(() => {
    const scope = context.scope;

    if (context.scopeType === 'customer') {
      change('customer', scope);
    } else if (context.scopeType === 'project') {
      change('customer', {
        name: scope.customer_name,
        uuid: scope.customer_uuid,
        url: scope.customer,
      });
      change('project', {
        name: scope.name,
        uuid: scope.uuid,
        url: scope.url,
        customer_uuid: scope.customer_uuid,
      });
    } else if (context.scopeType === 'resource') {
      change('customer', {
        name: scope.customer_name,
        uuid: scope.customer_uuid,
        url: scope.customer,
      });
      change('project', {
        name: scope.project_name,
        uuid: scope.project_uuid,
        url: scope.project,
        customer_uuid: scope.customer_uuid,
      });
      change('resource', {
        name: scope.name,
        uuid: scope.uuid,
        url: scope.url,
        project_uuid: scope.project_uuid,
        offering_name: scope.offering_name,
      });
    }
  }, [context, change]);

  // Clear context when standalone issue is checked
  useEffect(() => {
    if (standaloneIssue) {
      change('customer', undefined);
      change('project', undefined);
      change('resource', undefined);
    }
  }, [standaloneIssue, change]);

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
      <BooleanGroup
        name="standaloneIssue"
        label={translate(
          'Issue is general and not tied to any specific organization, project, or resource',
        )}
        disabled={['customer', 'project', 'resource'].includes(
          context.scopeType,
        )}
        space={5}
      />
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

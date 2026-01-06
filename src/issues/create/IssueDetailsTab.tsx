import { useCallback, useEffect } from 'react';
import { Alert, Form, Stack } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { change, Field, formValueSelector, isSubmitting } from 'redux-form';

import { ENV } from '@waldur/core/config';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { ProjectGroup } from '@waldur/issues/create/ProjectGroup';
import { RootState } from '@waldur/store/reducers';
import { getUser } from '@waldur/workspace/selectors';

import { IssueTypeChoice } from '../types/constants';

import { ISSUE_CREATION_FORM_ID } from './constants';
import { OrganizationGroup } from './OrganizationGroup';
import { ResourceGroup } from './ResourceGroup';
import { TypeField } from './TypeField';

const standaloneIssueSelector = (state: RootState) =>
  formValueSelector(ISSUE_CREATION_FORM_ID)(state, 'standaloneIssue');

const typeSelector = (state: RootState) =>
  formValueSelector(ISSUE_CREATION_FORM_ID)(state, 'type');

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
  const dispatch = useDispatch();
  const standaloneIssue = useSelector(standaloneIssueSelector);
  const type = useSelector(typeSelector);

  const user = useSelector(getUser);
  const isStaffOrSupport = user?.is_staff || user?.is_support;
  const submitting = useSelector(isSubmitting(ISSUE_CREATION_FORM_ID));

  // Get request types data from context (fetched in IssueCreateForm)
  const { issueTypes, isLoading, error } = context;

  const setValue = useCallback(
    (field, value) => dispatch(change(ISSUE_CREATION_FORM_ID, field, value)),
    [dispatch],
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
              {translate(
                'Staff info: No active RequestTypes found. Use the Atlassian Settings Discovery wizard to configure and activate request types.',
              )}
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
        <Form.Group className="mb-5">
          <Form.Label>{translate('Request type')}</Form.Label>
          <TypeField issueTypes={issueTypes} isDisabled={submitting} />
        </Form.Group>
      )}
      <Form.Group className="mb-5">
        <Field
          name="standaloneIssue"
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

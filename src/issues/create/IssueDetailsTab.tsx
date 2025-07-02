import { useCallback, useEffect } from 'react';
import { Form, Stack } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { change, Field, formValueSelector, isSubmitting } from 'redux-form';

import { ENV } from '@waldur/core/config';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { ProjectGroup } from '@waldur/issues/create/ProjectGroup';
import { RootState } from '@waldur/store/reducers';
import { getUser } from '@waldur/workspace/selectors';

import { IssueCreateButtonProps } from '../list/IssueCreateButton';
import { getIssueTypeChoices, ISSUE_IDS } from '../types/constants';
import { getIssueTypes, getShowAllTypes } from '../types/utils';

import { ISSUE_CREATION_FORM_ID } from './constants';
import { OrganizationGroup } from './OrganizationGroup';
import { ResourceGroup } from './ResourceGroup';
import { TypeField } from './TypeField';

const standaloneIssueSelector = (state: RootState) =>
  formValueSelector(ISSUE_CREATION_FORM_ID)(state, 'standaloneIssue');

const typeSelector = (state: RootState) =>
  formValueSelector(ISSUE_CREATION_FORM_ID)(state, 'type');

export const IssueDetailsTab = ({
  context,
}: {
  context: IssueCreateButtonProps;
}) => {
  const dispatch = useDispatch();
  const standaloneIssue = useSelector(standaloneIssueSelector);
  const type = useSelector(typeSelector);

  const user = useSelector(getUser);
  const showAllTypes = getShowAllTypes(user);
  const issueTypes = getIssueTypes(showAllTypes);
  const submitting = useSelector(isSubmitting(ISSUE_CREATION_FORM_ID));

  const setValue = useCallback(
    (field, value) => dispatch(change(ISSUE_CREATION_FORM_ID, field, value)),
    [dispatch, change],
  );

  useEffect(() => {
    if (!type) {
      setValue(
        'type',
        getIssueTypeChoices().find(
          (option) => option.id === ISSUE_IDS.INFORMATIONAL,
        ),
      );
    }
  }, [setValue, type]);

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

  useEffect(() => {
    if (standaloneIssue) {
      setValue('customer', undefined);
      setValue('project', undefined);
      setValue('resource', undefined);
    }
  }, [standaloneIssue, setValue]);

  return (
    <>
      {ENV.plugins.WALDUR_SUPPORT?.DISPLAY_REQUEST_TYPE && (
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
          disabled={context.scope !== user && Boolean(context.scope)}
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

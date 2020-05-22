import * as React from 'react';
import { useDispatch } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { getAll } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { BaseResource } from '@waldur/resource/types';
import { User, Customer, Project } from '@waldur/workspace/types';

import { AssigneeGroup } from './AssigneeGroup';
import { CallerGroup } from './CallerGroup';
import { ISSUE_REGISTRATION_FORM_ID } from './constants';
import { DescriptionGroup } from './DescriptionGroup';
import { OrganizationGroup } from './OrganizationGroup';
import { PriorityGroup } from './PriorityGroup';
import { ProjectGroup } from './ProjectGroup';
import { ResourceGroup } from './ResourceGroup';
import { SearchButton } from './SearchButton';
import { SummaryGroup } from './SummaryGroup';
import { TypeGroup } from './TypeGroup';
import { IssueTypeOption, IssueRequestPayload, Priority } from './types';
import { sendIssueCreateRequest } from './utils';

interface OwnProps {
  onSearch(filter: Record<string, any>): void;
}

interface IssueFormData {
  caller: User;
  customer: Customer;
  project: Project;
  type: IssueTypeOption;
  summary: string;
  description: string;
  assignee?: User;
  resource?: BaseResource;
  priority?: Priority;
}

export const IssueRegistration = reduxForm<IssueFormData, OwnProps>({
  form: ISSUE_REGISTRATION_FORM_ID,
})(({ onSearch, handleSubmit, submitting }) => {
  const dispatch = useDispatch();

  const createIssue = React.useCallback(
    async (formData: IssueFormData) => {
      const payload: IssueRequestPayload = {
        type: formData.type.id,
        customer: formData.customer.url,
        summary: formData.summary,
        description: formData.description,
        caller: formData.caller.url,
      };
      if (formData.project) {
        payload.project = formData.project.url;
      }
      if (formData.assignee) {
        payload.assignee = formData.assignee.url;
      }
      if (formData.resource) {
        payload.resource = formData.resource.url;
      }
      if (formData.priority) {
        payload.priority = formData.priority.name;
      }
      await sendIssueCreateRequest(payload, dispatch);
    },
    [dispatch],
  );

  const { loading, error, value: priorities } = useAsync(() =>
    getAll<Priority>('/support-priorities/'),
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <>{translate('Unable to load data.')}</>;
  }

  return (
    <form className="ibox" onSubmit={handleSubmit(createIssue)}>
      <div className="ibox-content">
        <div className="form-horizontal">
          <CallerGroup onSearch={onSearch} />
          <OrganizationGroup onSearch={onSearch} />
          <TypeGroup layout="horizontal" disabled={submitting} />
          <PriorityGroup priorities={priorities} disabled={submitting} />
          <SummaryGroup layout="horizontal" disabled={submitting} />
          <DescriptionGroup layout="horizontal" disabled={submitting} />
          <ProjectGroup disabled={submitting} onSearch={onSearch} />
          <ResourceGroup disabled={submitting} />
          <AssigneeGroup disabled={submitting} />
        </div>
      </div>
      <div className="ibox-content text-right">
        <SearchButton onSearch={onSearch} />{' '}
        <SubmitButton submitting={submitting} block={false}>
          {translate('Create request')}
        </SubmitButton>
      </div>
    </form>
  );
});

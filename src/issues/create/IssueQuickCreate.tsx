import { useCallback, useEffect } from 'react';
import { ControlLabel, FormGroup } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import { createSelector } from 'reselect';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { getList } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { BaseResource } from '@waldur/resource/types';
import { RootState } from '@waldur/store/reducers';
import { getUser } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

import { refreshProjects, refreshResources } from './api';
import { AsyncSelectField } from './AsyncSelectField';
import { DescriptionGroup } from './DescriptionGroup';
import { SummaryGroup } from './SummaryGroup';
import { TypeGroup } from './TypeGroup';
import { IssueRequestPayload, IssueTypeOption } from './types';
import { sendIssueCreateRequest } from './utils';

const filterOption = (options) => options;

export const ISSUE_QUICK_CREATE_FORM_ID = 'IssueQuickCreate';

const formSelector = formValueSelector(ISSUE_QUICK_CREATE_FORM_ID);

const projectSelector = (state: RootState) => formSelector(state, 'project');

const customerSelector = (state: RootState) => formSelector(state, 'customer');

const refreshCustomers = async (name: string) => {
  const params: Record<string, string> = {};
  if (name) {
    params.name = name;
  }
  const customers = await getList('/customers/', params);
  return { options: customers };
};

const OrganizationGroup = ({ disabled }) => (
  <FormGroup>
    <ControlLabel>{translate('Organization')}</ControlLabel>
    <Field
      name="customer"
      component={AsyncSelectField}
      placeholder={translate('Select organization...')}
      isClearable={true}
      defaultOptions
      loadOptions={refreshCustomers}
      getOptionValue={(option) => option.name}
      getOptionLabel={(option) => option.name}
      filterOption={filterOption}
      isDisabled={disabled}
    />
  </FormGroup>
);

const projectRequiredSelector = createSelector(
  /* Project should be specified only if user has selected customer
   * but user is not owner and user is not staff and user is not customer owner.
   */
  customerSelector,
  getUser,
  (customer, user) => {
    if (!customer) {
      return false;
    }

    if (user.is_staff || user.is_support) {
      return false;
    }

    return (
      customer.owners.find((owner) => owner.uuid === user.uuid) === undefined
    );
  },
);

export const ProjectGroup = ({ disabled, customer, formId }) => {
  const dispatch = useDispatch();
  const projectRequired = useSelector(projectRequiredSelector);

  const loadOptions = useCallback((name) => refreshProjects(name, customer), [
    customer,
  ]);

  useEffect(() => {
    dispatch(change(formId, 'project', undefined));
  }, [dispatch, customer]);

  return (
    <FormGroup>
      <ControlLabel>
        {translate('Project')}
        {projectRequired && <span className="text-danger">*</span>}
      </ControlLabel>
      {customer ? (
        <Field
          name="project"
          component={AsyncSelectField}
          placeholder={translate('Select project...')}
          isClearable={true}
          defaultOptions
          loadOptions={loadOptions}
          getOptionValue={(option) => option.name}
          getOptionLabel={(option) => option.name}
          filterOption={filterOption}
          isDisabled={disabled}
          required={projectRequired}
        />
      ) : (
        <Select
          options={[]}
          isDisabled={true}
          placeholder={translate('Select project...')}
        />
      )}
    </FormGroup>
  );
};

export const ResourceGroup = ({ disabled, project, formId }) => {
  const dispatch = useDispatch();
  const loadData = useCallback((name) => refreshResources(name, project), [
    project,
  ]);

  useEffect(() => {
    dispatch(change(formId, 'resource', undefined));
  }, [dispatch, project]);

  return (
    <FormGroup>
      <ControlLabel>{translate('Affected resource')}</ControlLabel>
      {project ? (
        <Field
          name="resource"
          component={AsyncSelectField}
          placeholder={translate('Select affected resource...')}
          isClearable={true}
          defaultOptions
          loadOptions={loadData}
          getOptionValue={(option) => option.name}
          getOptionLabel={(option) => option.name}
          filterOption={filterOption}
          isDisabled={disabled}
        />
      ) : (
        <Select
          options={[]}
          isDisabled={true}
          placeholder={translate('Select affected resource...')}
        />
      )}
    </FormGroup>
  );
};

interface IssueFormData {
  type: IssueTypeOption;
  summary: string;
  description: string;
  customer: Customer;
  project: Project;
  resource?: BaseResource;
}

export const IssueQuickCreate = reduxForm<IssueFormData>({
  form: ISSUE_QUICK_CREATE_FORM_ID,
})(({ handleSubmit, submitting }) => {
  const dispatch = useDispatch();

  const createIssue = useCallback(
    async (formData: IssueFormData) => {
      const payload: IssueRequestPayload = {
        type: formData.type.id,
        summary: formData.summary,
        description: formData.description,
        is_reported_manually: true,
      };

      if (formData.resource) {
        payload.resource = formData.resource.url;
      } else if (formData.project) {
        payload.project = formData.project.url;
      } else if (formData.customer) {
        payload.customer = formData.customer.url;
      }
      await sendIssueCreateRequest(payload, dispatch);
    },
    [dispatch],
  );

  return (
    <form className="ibox float-e-margins" onSubmit={handleSubmit(createIssue)}>
      <div className="ibox-title">
        <h5>{translate('Create request')}</h5>
      </div>
      <div className="ibox-content">
        <TypeGroup layout="vertical" disabled={submitting} />
        <SummaryGroup layout="vertical" disabled={submitting} />
        <DescriptionGroup layout="vertical" disabled={submitting} />
        <OrganizationGroup disabled={submitting} />
        <ProjectGroup
          disabled={submitting}
          customer={useSelector(customerSelector)}
          formId={ISSUE_QUICK_CREATE_FORM_ID}
        />
        <ResourceGroup
          disabled={submitting}
          project={useSelector(projectSelector)}
          formId={ISSUE_QUICK_CREATE_FORM_ID}
        />
        <div className="text-right">
          <SubmitButton submitting={submitting} block={false}>
            {translate('Create request')}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
});

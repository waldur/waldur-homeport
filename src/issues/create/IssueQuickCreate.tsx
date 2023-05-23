import { useCurrentStateAndParams } from '@uirouter/react';
import { useCallback, useEffect } from 'react';
import { Card, Form } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import { createSelector } from 'reselect';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { ENV } from '@waldur/configs/default';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { formatResourceShort } from '@waldur/marketplace/utils';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { getCustomersList } from '@waldur/project/api';
import { BaseResource } from '@waldur/resource/types';
import { RootState } from '@waldur/store/reducers';
import { getUser } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

import { refreshProjects, refetchs } from './api';
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
  const customers = await getCustomersList(params);
  return { options: customers };
};

const OrganizationGroup = ({ disabled }) => (
  <Form.Group>
    <Form.Label>{translate('Organization')}</Form.Label>
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
  </Form.Group>
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
  const { state } = useCurrentStateAndParams();
  const dispatch = useDispatch();
  const projectRequired = useSelector(projectRequiredSelector);

  const loadOptions = useCallback(
    (name) => refreshProjects(name, customer),
    [customer],
  );

  useEffect(() => {
    dispatch(change(formId, 'project', undefined));
  }, [dispatch, customer]);

  return (
    <Form.Group className="mb-5">
      <Form.Label>
        {translate('Project')}
        {projectRequired && <span className="text-danger">*</span>}
      </Form.Label>
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
          isDisabled={disabled || isDescendantOf('project', state)}
          required={projectRequired}
        />
      ) : (
        <Select
          options={[]}
          isDisabled={true}
          placeholder={translate('Select project...')}
        />
      )}
    </Form.Group>
  );
};

export const ResourceGroup = ({ disabled, project, formId }) => {
  const dispatch = useDispatch();
  const loadData = useCallback((name) => refetchs(name, project), [project]);

  useEffect(() => {
    dispatch(change(formId, 'resource', undefined));
  }, [dispatch, project]);

  return (
    <Form.Group className="mb-5">
      <Form.Label>{translate('Affected resource')}</Form.Label>
      {project ? (
        <Field
          name="resource"
          component={AsyncSelectField}
          placeholder={translate('Select affected resource...')}
          isClearable={true}
          defaultOptions
          loadOptions={loadData}
          getOptionValue={(option) => formatResourceShort(option)}
          getOptionLabel={(option) => formatResourceShort(option)}
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
    </Form.Group>
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
    <Card>
      <form onSubmit={handleSubmit(createIssue)}>
        <Card.Header>
          <Card.Title>
            <h3>{translate('Create request')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          {ENV.plugins.WALDUR_SUPPORT?.DISPLAY_REQUEST_TYPE ? (
            <TypeGroup disabled={submitting} />
          ) : null}
          <SummaryGroup disabled={submitting} />
          <DescriptionGroup disabled={submitting} />
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
        </Card.Body>
      </form>
    </Card>
  );
});

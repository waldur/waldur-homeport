import { useCurrentStateAndParams } from '@uirouter/react';
import { useCallback, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { Field, formValueSelector, change } from 'redux-form';
import { createSelector } from 'reselect';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { formatResourceShort } from '@waldur/marketplace/utils';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { RootState } from '@waldur/store/reducers';
import { getUser } from '@waldur/workspace/selectors';

import { refreshProjects, refetchs } from './api';
import { AsyncSelectField } from './AsyncSelectField';

const filterOption = (options) => options;

export const ISSUE_QUICK_CREATE_FORM_ID = 'IssueQuickCreate';

const formSelector = formValueSelector(ISSUE_QUICK_CREATE_FORM_ID);

const customerSelector = (state: RootState) => formSelector(state, 'customer');

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

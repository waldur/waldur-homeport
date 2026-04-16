import { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { change, Field, formValueSelector } from 'redux-form';

import { Select as AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { projectAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { type RootState } from '@waldur/store/reducers';

import { ISSUE_CREATION_FORM_ID } from './constants';

const customerSelector = (state: RootState) =>
  formValueSelector(ISSUE_CREATION_FORM_ID)(state, 'customer');

const projectSelector = (state: RootState) =>
  formValueSelector(ISSUE_CREATION_FORM_ID)(state, 'project');

export const ProjectGroup = ({ disabled }) => {
  const dispatch = useDispatch();
  const customer = useSelector(customerSelector);
  const project = useSelector(projectSelector);

  useEffect(() => {
    if (project && customer && project.customer_uuid !== customer.uuid) {
      dispatch(change(ISSUE_CREATION_FORM_ID, 'project', undefined));
    }
  }, [dispatch, customer, project]);

  return (
    <Form.Group className="mb-5 flex-equal">
      <Form.Label>{translate('Project')}</Form.Label>
      {!disabled && customer ? (
        <Field
          name="project"
          component={AsyncSelectField}
          isClearable={true}
          defaultOptions
          loadOptions={(query, prevOptions, page) =>
            projectAutocomplete(customer.uuid, query, prevOptions, page, {
              field: ['name', 'url', 'uuid', 'customer_uuid'],
            })
          }
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          filterOption={(options) => options}
          isDisabled={disabled}
          key={customer.uuid}
        />
      ) : (
        <Field
          name="project"
          component={({ input: { value } }) => (
            <Select
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.name}
              options={
                project
                  ? [
                      {
                        name: project.name,
                        uuid: project.uuid,
                        url: project.url,
                      },
                    ]
                  : []
              }
              value={value}
              isDisabled
              className="metronic-select-container"
              classNamePrefix="metronic-select"
            />
          )}
        />
      )}
    </Form.Group>
  );
};

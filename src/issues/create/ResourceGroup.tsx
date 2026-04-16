import { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { change, Field, formValueSelector } from 'redux-form';
import { MarketplaceResourcesListData } from 'waldur-js-client';

import { Select as AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { resourceAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { NON_TERMINATED_STATES } from '@waldur/marketplace/resources/list/constants';
import { formatResourceShort } from '@waldur/marketplace/utils';
import { RootState } from '@waldur/store/reducers';

import { ISSUE_CREATION_FORM_ID } from './constants';

const projectSelector = (state: RootState) =>
  formValueSelector(ISSUE_CREATION_FORM_ID)(state, 'project');

const resourceSelector = (state: RootState) =>
  formValueSelector(ISSUE_CREATION_FORM_ID)(state, 'resource');

export const ResourceGroup = ({ disabled }) => {
  const project = useSelector(projectSelector);
  const resource = useSelector(resourceSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    if (resource && project && resource.project_uuid !== project.uuid) {
      dispatch(change(ISSUE_CREATION_FORM_ID, 'resource', undefined));
    }
  }, [dispatch, project, resource]);

  return (
    <Form.Group className="mb-5">
      <Form.Label>{translate('Affected resource')}</Form.Label>
      {project ? (
        <Field
          name="resource"
          component={AsyncSelectField}
          isClearable={true}
          defaultOptions
          loadOptions={(query, prevOptions, page) =>
            resourceAutocomplete(
              {
                project_uuid: project.uuid,
                name: query,
                field: ['name', 'url', 'uuid', 'offering_name', 'project_uuid'],
                state:
                  NON_TERMINATED_STATES as MarketplaceResourcesListData['query']['state'],
              },
              prevOptions,
              page,
            )
          }
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => formatResourceShort(option)}
          filterOption={(options) => options}
          isDisabled={disabled}
          key={project.uuid}
        />
      ) : (
        <Field
          name="resource"
          component={({ input: { value } }) => (
            <Select
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => formatResourceShort(option)}
              options={
                resource
                  ? [
                      {
                        name: resource.name,
                        uuid: resource.uuid,
                        url: resource.url,
                        offering_name: resource.offering_name,
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

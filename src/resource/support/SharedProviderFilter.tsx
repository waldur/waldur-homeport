import { FunctionComponent } from 'react';
import { Card, Form } from 'react-bootstrap';
import { Field, reduxForm, formValueSelector } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { getSelectData } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

const providerAutocomplete = async (
  query: string,
  prevOptions,
  currentPage: number,
) => {
  const params = {
    name: query,
    type: 'OpenStack',
    shared: true,
    field: ['name', 'uuid'],
    o: 'name',
    page: currentPage,
    page_size: ENV.pageSize,
  };
  const response = await getSelectData('/service-settings/', params);
  return returnReactSelectAsyncPaginateObject(
    response,
    prevOptions,
    currentPage,
  );
};

export const SharedProviderFilter: FunctionComponent = () => (
  <Card>
    <Card.Body>
      <div className="row">
        <Form.Group className="col-sm-3">
          <Form.Label>{translate('Provider')}</Form.Label>
          <Field
            name="provider"
            component={(fieldProps) => (
              <AsyncPaginate
                placeholder={translate('Select provider...')}
                defaultOptions
                loadOptions={(query, prevOptions, { page }) =>
                  providerAutocomplete(query, prevOptions, page)
                }
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.name}
                value={fieldProps.input.value}
                onChange={(value) => fieldProps.input.onChange(value)}
                noOptionsMessage={() => translate('No providers')}
                isClearable={true}
                additional={{
                  page: 1,
                }}
              />
            )}
          />
        </Form.Group>
      </div>
    </Card.Body>
  </Card>
);

const FORM_ID = 'SharedProviderFilter';

export const providerSelector = (state: RootState) =>
  formValueSelector(FORM_ID)(state, 'provider');

const enhance = reduxForm({ form: FORM_ID });

export const SharedProviderFilterContainer = enhance(SharedProviderFilter);

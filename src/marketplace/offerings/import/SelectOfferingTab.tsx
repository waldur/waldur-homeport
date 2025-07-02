import { useQuery } from '@tanstack/react-query';
import { groupBy } from 'lodash-es';
import { useDispatch, useSelector } from 'react-redux';
import { change } from 'redux-form';
import { remoteWaldurApiSharedOfferings } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { FormContainer, SelectField } from '@waldur/form';
import { MultiSelectOption } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import { Offering } from '@waldur/marketplace/types';
import { Field } from '@waldur/resource/summary';

import { OFFERING_IMPORT_FORM_ID } from './constants';
import { ErredRemoteConnection } from './ErredRemoteConnection';
import { importOfferingSelector } from './selectors';

export const SelectOfferingTab = () => {
  const formData = useSelector(importOfferingSelector);
  const {
    isLoading,
    error,
    data: offerings,
  } = useQuery({
    queryKey: [
      'RemoteOfferings',
      formData?.api_url,
      !formData?.token,
      !formData?.customer?.uuid,
    ],

    queryFn: () => {
      if (!formData?.api_url || !formData?.token || !formData?.customer?.uuid) {
        return Promise.reject(
          new Error(translate('Please check the credentials again.')),
        );
      }
      return remoteWaldurApiSharedOfferings({
        query: { customer_uuid: formData.customer?.uuid },
        body: {
          api_url: formData.api_url,
          token: formData.token,
        },
      }).then((response) =>
        response.data.map((offering) => ({
          ...offering,
          type_label: getLabel(offering.type),
        })),
      );
    },

    staleTime: 60 * 1000,
    retry: false,
  });

  const dispatch = useDispatch();
  const updateCategoriesMapping = (offerings: Offering[]) => {
    const groupedByCategory = groupBy(
      offerings,
      (offering) => offering.category_title,
    );
    const categoriesMap = Object.keys(groupedByCategory).map((category) => ({
      remote_category: category,
      local_category: '',
    }));
    dispatch(change(OFFERING_IMPORT_FORM_ID, 'categories_set', categoriesMap));
  };

  return (
    <FormContainer
      submitting={false}
      clearOnUnmount={false}
      className="size-lg"
    >
      <Field
        label={translate('API URL')}
        value={formData?.api_url}
        isStuck
        className="border-bottom border-top py-5 mb-5"
        labelClass="fw-bolder me-3"
      />

      <SelectField
        name="offerings"
        label={translate('Offerings')}
        isLoading={isLoading}
        options={offerings}
        isMulti
        getOptionValue={(option) => option.uuid}
        getOptionLabel={(option) => option.name}
        validate={required}
        onChange={updateCategoriesMapping}
        components={{
          Option: (props) => (
            <MultiSelectOption
              {...props}
              label={
                <>
                  {props.data.name}
                  {props.data.category_title ? (
                    <span className="text-muted">
                      {' / '}
                      {props.data.category_title}
                    </span>
                  ) : null}
                </>
              }
            />
          ),
        }}
      />

      {isLoading ? null : error ? (
        <ErredRemoteConnection
          error={error}
          message={translate('Unable to load offerings')}
        />
      ) : offerings?.length === 0 ? (
        <p className="text-danger">
          {translate('There are no offerings yet.')}
        </p>
      ) : null}
    </FormContainer>
  );
};

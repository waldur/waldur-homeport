import { useQuery } from '@tanstack/react-query';
import { groupBy } from 'lodash-es';
import { useForm, useFormState } from 'react-final-form';
import { remoteWaldurApiSharedOfferings } from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import { FormContainer, SelectField } from '@/form';
import { MultiSelectOption } from '@/form/themed-select';
import { translate } from '@/i18n';
import { getLabel } from '@/marketplace/common/registry';
import { Offering } from '@/marketplace/types';
import { Field } from '@/resource/summary';

import { ErredRemoteConnection } from './ErredRemoteConnection';
import { OfferingImportFormData } from './types';

export const SelectOfferingTab = () => {
  const { values: formData } = useFormState<OfferingImportFormData>();
  const form = useForm();

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

    staleTime: SHORT_STALE_TIME,
    retry: false,
  });

  const updateCategoriesMapping = (offerings: Offering[]) => {
    const groupedByCategory = groupBy(
      offerings,
      (offering) => offering.category_title,
    );
    const categoriesMap = Object.keys(groupedByCategory).map((category) => ({
      remote_category: category,
      local_category: '',
    }));
    form.change('categories_set', categoriesMap);
  };

  return (
    <FormContainer submitting={false} className="size-lg">
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

import { useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { FormLabel } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { openstackImagesList } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { BoxRadioField } from '@/marketplace/deploy/steps/BoxRadioField';
import { FormStepProps } from '@/marketplace/deploy/types';
import { generateSystemImageChoices } from '@/marketplace/deploy/utils';
import { VStepperFormStepCard } from '@/wizard';

export const FormImageStep = (props: FormStepProps) => {
  const [query, setQuery] = useState('');

  const applyQuery = useCallback(
    debounce((value) => {
      setQuery(String(value).trim());
    }, 1000),
    [setQuery],
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['deployImages', props.offering?.scope_uuid, query],

    queryFn: () =>
      props.offering.scope_uuid
        ? getAllPages((page) =>
            openstackImagesList({
              query: {
                page,
                tenant_uuid: props.offering.scope_uuid,
                name: query,
                is_rescue_image: false,
              },
            }),
          )
        : Promise.resolve([]),

    staleTime: UI_STALE_TIME,
  });

  const choices = useMemo(() => generateSystemImageChoices(data), [data]);

  return (
    <VStepperFormStepCard
      title={translate('Image')}
      id={props.id}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
      actions={
        <div className="ms-auto">
          <FilterBox
            type="search"
            placeholder={translate('Search')}
            onChange={(e) => applyQuery(e.target.value)}
          />
        </div>
      }
    >
      <FormLabel className="required">
        {translate('Operating system options')}
      </FormLabel>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : data.length === 0 ? (
        <p className="text-center">
          {translate('There are no option to choose.')}
        </p>
      ) : (
        <Field name="attributes.image" validate={required}>
          {(fieldProps) => (
            <BoxRadioField
              {...fieldProps}
              choices={choices}
              vertical
              required
            />
          )}
        </Field>
      )}
    </VStepperFormStepCard>
  );
};

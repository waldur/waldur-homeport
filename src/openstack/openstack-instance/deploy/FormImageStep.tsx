import { useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { FormLabel } from 'react-bootstrap';
import { Field } from 'redux-form';
import { openstackImagesList } from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { FilterBox } from '@waldur/form/FilterBox';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { BoxRadioField } from '@waldur/marketplace/deploy/steps/BoxRadioField';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { generateSystemImageChoices } from '@waldur/marketplace/deploy/utils';

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
              },
            }),
          )
        : Promise.resolve([]),

    staleTime: 3 * 60 * 1000,
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
        <Field
          name="attributes.image"
          validate={[required]}
          component={BoxRadioField}
          choices={choices}
          vertical
          required
        />
      )}
    </VStepperFormStepCard>
  );
};

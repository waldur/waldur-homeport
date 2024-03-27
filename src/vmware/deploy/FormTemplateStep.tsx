import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Field } from 'redux-form';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { required } from '@waldur/core/validators';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { BoxRadioField } from '@waldur/marketplace/deploy/steps/BoxRadioField';
import {
  StepCardTabs,
  TabSpec,
} from '@waldur/marketplace/deploy/steps/StepCardTabs';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { generateSystemImageChoices } from '@waldur/marketplace/deploy/utils';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { getVMwareTemplates } from '../api';
import { VMwareTemplate } from '../types';

const tabs: TabSpec[] = [
  { title: translate('Images'), key: 'images' },
  { title: translate('Apps'), key: 'apps' },
];

export const FormTemplateStep = (props: FormStepProps) => {
  const [tab, setTab] = useState<TabSpec>(tabs[0]);
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  const { data, isLoading, error, refetch } = useQuery(
    ['VMwareImages', props.offering?.scope_uuid, props.offering?.customer_uuid],
    () =>
      props.offering.scope_uuid && props.offering.customer_uuid
        ? getVMwareTemplates(
            props.offering.scope_uuid,
            props.offering.customer_uuid,
          )
        : Promise.resolve([]),
    { staleTime: 3 * 60 * 1000 },
  );

  const choices = useMemo(() => {
    const _choices = generateSystemImageChoices(data);
    _choices.forEach((choice) => {
      choice.image =
        choice.image && typeof choice.image === 'string' ? (
          <img src={choice.image} alt="os" />
        ) : undefined;
    });
    return _choices;
  }, [data]);

  const onChangeImage = useCallback(
    (value: VMwareTemplate) => {
      props.change('limits.cpu', value.cores);
      props.change('limits.ram', value.ram / 1024);
      props.change('limits.disk', value.disk / 1024);
      props.change('attributes.cores_per_socket', value.cores_per_socket);
    },
    [props.change],
  );

  // Initialize template
  useEffect(() => {
    if (data?.length > 0) {
      const template = data[0];
      onChangeImage(template);
    }
  }, [props.offering, data, onChangeImage]);

  return (
    <VStepperFormStepCard
      title={translate('Template')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
      required={props.required}
      actions={
        showExperimentalUiComponents ? (
          <StepCardTabs tabs={tabs} tab={tab} setTab={setTab} />
        ) : null
      }
    >
      {isLoading ? (
        <p className="text-center">{translate('Loading')}</p>
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : data.length === 0 ? (
        <p className="text-center">
          {translate('There are no option to choose.')}
        </p>
      ) : (
        <Field
          name="attributes.template"
          validate={[required]}
          component={BoxRadioField}
          choices={choices}
          required
          onChange={onChangeImage as any}
        />
      )}
    </VStepperFormStepCard>
  );
};

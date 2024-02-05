import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { BoxRadioField } from '@waldur/marketplace/deploy/steps/BoxRadioField';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { StepCardTabs } from '@waldur/marketplace/deploy/steps/StepCardTabs';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { generateSystemImageChoices } from '@waldur/marketplace/deploy/utils';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { loadImages } from '@waldur/openstack/api';
import { flavorValidator } from '@waldur/openstack/openstack-instance/utils';

import { formFlavorSelector } from './utils';

const tabs = [
  { label: translate('Images'), value: 'images' },
  { label: translate('Apps'), value: 'apps' },
];

export const FormImageStep = (props: FormStepProps) => {
  const [tab, setTab] = useState<'images' | 'apps'>('images');
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  const { data, isLoading, error, refetch } = useQuery(
    ['deployImages', props.offering?.scope_uuid],
    () =>
      props.offering.scope_uuid
        ? loadImages(props.offering.scope_uuid)
        : Promise.resolve([]),
    { staleTime: 3 * 60 * 1000 },
  );

  const choices = useMemo(() => {
    const _choices = generateSystemImageChoices(data);
    _choices.forEach((choice) => {
      choice.image =
        choice.image && typeof choice.image === 'string' ? (
          <img src={choice.image} />
        ) : undefined;
    });
    return _choices;
  }, [data]);

  const flavor = useSelector(formFlavorSelector);
  const onChangeImage = useCallback(
    (value) => {
      if (flavor && flavorValidator({ image: value }, flavor)) {
        props.change('attributes.flavor', undefined);
      }
    },
    [flavor, props.change],
  );

  return (
    <StepCard
      title={translate('Image')}
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
          name="attributes.image"
          validate={[required]}
          component={BoxRadioField}
          choices={choices}
          required
          onChange={onChangeImage}
        />
      )}
    </StepCard>
  );
};

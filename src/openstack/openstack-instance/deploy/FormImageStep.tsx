import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import {
  BoxRadioChoice,
  BoxRadioField,
} from '@waldur/marketplace/deploy/steps/BoxRadioField';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { StepCardTabs } from '@waldur/marketplace/deploy/steps/StepCardTabs';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { loadImages } from '@waldur/openstack/api';
import { flavorValidator } from '@waldur/openstack/openstack-instance/utils';

import { formFlavorSelector } from './utils';

const CentOS = require('@waldur/images/appstore/centos.svg');
const Debian = require('@waldur/images/appstore/debian.svg');
const FreeBSD = require('@waldur/images/appstore/freebsd-1.svg');
const Oracle = require('@waldur/images/appstore/oracle.svg');
const Rocky = require('@waldur/images/appstore/rocky.svg');
const Ubuntu = require('@waldur/images/appstore/ubuntu.svg');
const Windows = require('@waldur/images/appstore/windows.svg');

const images = [
  { name: 'ubuntu', label: 'Ubuntu', thumb: Ubuntu },
  { name: 'debian', label: 'Debian', thumb: Debian },
  { name: 'centos', label: 'CentOS', thumb: CentOS },
  { name: 'rocky', label: 'Rocky', thumb: Rocky },
  { name: 'windows server', label: 'Windows server', thumb: Windows },
  { name: 'windows', label: 'Windows', thumb: Windows },
  { name: 'oracle', label: 'Oracle', thumb: Oracle },
  { name: 'freebsd', label: 'FreeBSD', thumb: FreeBSD },
];

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
    if (!data?.length) return [];
    const _choices = data.reduce<BoxRadioChoice[]>((acc, value) => {
      const image = images.find((item) =>
        value.name.toLowerCase().includes(item.name),
      );
      if (image) {
        /* eslint-disable no-useless-escape */
        const version = value.name
          .replace(new RegExp(`.*${image.name}\D*`, 'gi'), '')
          .trim();

        const prevChoice = acc.find((choice) => choice.value === image.name);
        if (prevChoice) {
          prevChoice.options.push({ label: version, value });
        } else {
          const choice = {
            label: image.label,
            value: image.name,
            image: image.thumb ? <img src={image.thumb} /> : undefined,
            options: [{ label: version, value }],
          };
          acc.push(choice);
        }
      } else {
        const version = value.name.replace(/^\d*\D*/gi, '').trim();
        const match = value.name.match(/^\d*\D*/gi);
        const label = match.pop().trim();
        const choice = {
          label,
          value: label,
          options: [{ label: version, value }],
        };
        acc.push(choice);
      }
      return acc;
    }, []);
    _choices.forEach((choice) => {
      choice.options.sort((a, b) => b.label - a.label);
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

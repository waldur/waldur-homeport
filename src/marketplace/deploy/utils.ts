import { createElement } from 'react';
import { isValid, getFormSyncErrors } from 'redux-form';

import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import CentOS from '@waldur/images/appstore/centos.svg';
import Debian from '@waldur/images/appstore/debian.svg';
import FreeBSD from '@waldur/images/appstore/freebsd-1.svg';
import Oracle from '@waldur/images/appstore/oracle.svg';
import Rocky from '@waldur/images/appstore/rocky.svg';
import Ubuntu from '@waldur/images/appstore/ubuntu.svg';
import Windows from '@waldur/images/appstore/windows.svg';
import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

import { FORM_ID } from '../details/constants';
import { formDataSelector } from '../utils';

import { BoxRadioChoice } from './steps/BoxRadioField';
import { OfferingConfigurationFormStep } from './types';

export const SYSTEM_IMAGES = [
  { name: 'ubuntu', label: 'Ubuntu', thumb: Ubuntu },
  { name: 'debian', label: 'Debian', thumb: Debian },
  { name: 'centos', label: 'CentOS', thumb: CentOS },
  { name: 'rocky', label: 'Rocky', thumb: Rocky },
  { name: 'windows server', label: 'Windows server', thumb: Windows },
  { name: 'windows', label: 'Windows', thumb: Windows },
  { name: 'oracle', label: 'Oracle', thumb: Oracle },
  { name: 'freebsd', label: 'FreeBSD', thumb: FreeBSD },
];

const findImage = (name) =>
  SYSTEM_IMAGES.find((item) => name.toLowerCase().includes(item.name));

export const generateSystemImageChoices = (data: any[]) => {
  if (!data?.length) return [];
  const _choices = data.reduce<BoxRadioChoice[]>((acc, value) => {
    const image = findImage(value.name);
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
          image: createElement(image.thumb),
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
};

export const scrollToView = (viewId: string) => {
  const el = document.getElementById(viewId);
  window.scroll({
    behavior: 'smooth',
    left: 0,
    top: el.offsetTop - 130,
  });
};

export const hasStepWithField = (
  steps: OfferingConfigurationFormStep[],
  field: string,
) =>
  steps &&
  steps.some((step) => step.fields && step.fields.some((key) => key === field));

export const concealPricesSelector = (state: RootState) =>
  isVisible(state, MarketplaceFeatures.conceal_prices);

export const formProjectSelector = (state: RootState) => {
  const formData = formDataSelector(state);
  return formData.project;
};

export const formIsValidSelector = (state: RootState) =>
  isValid(FORM_ID)(state);

export const formErrorsSelector = (state: RootState) =>
  getFormSyncErrors(FORM_ID)(state) as any;

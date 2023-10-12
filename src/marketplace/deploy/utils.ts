import { isValid, getFormSyncErrors } from 'redux-form';

import { isVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';

import { FORM_ID } from '../details/constants';
import { formDataSelector } from '../utils';

import { BoxRadioChoice } from './steps/BoxRadioField';
import { OfferingConfigurationFormStep } from './types';

const CentOS = require('@waldur/images/appstore/centos.svg');
const Debian = require('@waldur/images/appstore/debian.svg');
const FreeBSD = require('@waldur/images/appstore/freebsd-1.svg');
const Oracle = require('@waldur/images/appstore/oracle.svg');
const Rocky = require('@waldur/images/appstore/rocky.svg');
const Ubuntu = require('@waldur/images/appstore/ubuntu.svg');
const Windows = require('@waldur/images/appstore/windows.svg');

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

export const generateSystemImageChoices = (data: any[]) => {
  if (!data?.length) return [];
  const _choices = data.reduce<BoxRadioChoice[]>((acc, value) => {
    const image = SYSTEM_IMAGES.find((item) =>
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
          image: image.thumb,
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
  isVisible(state, 'marketplace.conceal_prices');

export const formProjectSelector = (state: RootState) => {
  const formData = formDataSelector(state);
  return formData.project;
};

export const formIsValidSelector = (state: RootState) =>
  isValid(FORM_ID)(state);

export const formErrorsSelector = (state: RootState) =>
  getFormSyncErrors(FORM_ID)(state) as any;

import { createSelector } from 'reselect';

import { offeringSelector } from '@waldur/marketplace/details/selectors';
import { Limits } from '@waldur/marketplace/details/types';
import { OfferingFormData } from '@waldur/marketplace/offerings/store/types';
import { Plan } from '@waldur/marketplace/types';

import { PricesData } from './types';
import { combinePlanLimit } from './utils';

const planSelector = (state: OfferingFormData): Plan => offeringSelector(state, 'plan');
const limitsSelector = (state: OfferingFormData): Limits => offeringSelector(state, 'limits');

export const pricesSelector =
  createSelector<OfferingFormData, Plan, Limits, PricesData>(planSelector, limitsSelector, combinePlanLimit);

export const totalPriceSelector = createSelector(pricesSelector, (pricesData: PricesData) => pricesData.total);

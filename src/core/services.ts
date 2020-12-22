import { StateService } from '@uirouter/core';

import { ENV } from '@waldur/configs/default';

export let $rootScope = null;
export let $compile = null;
export let $state: StateService = null;
export let $filter = null;
export let $uiRouterGlobals = null;
export let ngInjector = null;
export let $q: angular.IQService = null;

export const formatCurrency = (
  value: string | number,
  currency: string,
  fractionSize: number,
) => {
  if (typeof value === 'string') value = parseFloat(value);
  return `${currency}${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: fractionSize,
  }).format(value)}`;
};

export const defaultCurrency = (value) => {
  if (value === undefined || value === null) {
    return value;
  }
  let fractionSize = 2;
  if (value !== 0 && Math.abs(value) < 0.01) {
    fractionSize = 3;
  }
  if (value !== 0 && Math.abs(value) < 0.001) {
    fractionSize = 4;
  }
  return formatCurrency(value, ENV.currency, fractionSize);
};

export default function injectServices($injector) {
  $rootScope = $injector.get('$rootScope');
  $compile = $injector.get('$compile');
  $state = $injector.get('$state');
  $filter = $injector.get('$filter');
  $uiRouterGlobals = $injector.get('$uiRouterGlobals');
  $q = $injector.get('$q');
  ngInjector = $injector;
}
injectServices.$inject = ['$injector'];

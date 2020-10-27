export let ENV = null;
export let $rootScope = null;
export let $compile = null;
export let $state = null;
export let $filter = null;
export let $uiRouterGlobals = null;
export let ngInjector = null;
export let $q = null;
// Init with identity function for testing only.
// When application is initialized, it is replaced with actual service.
export let $sanitize = (x) => x;

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
  ENV = $injector.get('ENV');
  $rootScope = $injector.get('$rootScope');
  $compile = $injector.get('$compile');
  $state = $injector.get('$state');
  $filter = $injector.get('$filter');
  $uiRouterGlobals = $injector.get('$uiRouterGlobals');
  $q = $injector.get('$q');
  $sanitize = $injector.get('$sanitize');
  ngInjector = $injector;
}
injectServices.$inject = ['$injector'];

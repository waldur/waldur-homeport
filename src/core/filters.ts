import { router } from '@waldur/router';

import { isEmpty } from './utils';

const formatParam = (param: string) => {
  const decoded = (decodeURIComponent(param) as any).replaceAll('+', ' ');
  try {
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

const getQueryParams = () => {
  const search = router.urlService.search();
  let urlParams = {};
  for (const [key, value] of Object.entries(search)) {
    urlParams = {
      ...urlParams,
      [key]: formatParam(value),
    };
  }
  return urlParams;
};

// Refer to https://stackoverflow.com/a/41542008
export const syncFiltersToURL = (form: any) => {
  if (!form || isEmpty(form)) {
    return;
  }
  if ('URLSearchParams' in window) {
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(form)) {
      if (key && value) {
        searchParams.set(key, JSON.stringify(value));
      }
      if (!value) {
        searchParams.delete(key);
      }
    }
    const newRelativePathQuery =
      window.location.pathname + '?' + searchParams.toString();
    history.pushState(null, '', newRelativePathQuery);
  }
};

export const getInitialValues = (initialValues?) => {
  const queryParams = getQueryParams();
  if (isEmpty(queryParams)) {
    return initialValues;
  }
  let queryParamValues = {};
  for (const [key, value] of Object.entries(queryParams)) {
    if (key && value) {
      queryParamValues = {
        ...queryParamValues,
        [key]: value,
      };
    }
  }
  return queryParamValues;
};

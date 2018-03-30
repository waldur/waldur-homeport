export const SERVICE_USAGE_FETCH_START = 'waldur/appstore/providers/support/FETCH_START';
export const SERVICE_USAGE_FETCH_DONE = 'waldur/appstore/providers/support/FETCH_DONE';
export const SERVICE_USAGE_FETCH_ERROR = 'waldur/appstore/providers/support/FETCH_ERROR';
export const SERVICE_SELECT = 'waldur/appstore/providers/support/SERVICE_SELECT';
export const FILTER_SHOW = 'waldur/appstore/providers/support/FILTER_SHOW';
export const FILTER_HIDE = 'waldur/appstore/providers/support/FILTER_HIDE';

export const fetchServiceUsageStart = () => ({
  type: SERVICE_USAGE_FETCH_START,
});

export const fetchServiceUsageDone = data => {
  return {
    type: SERVICE_USAGE_FETCH_DONE,
    payload: {data},
  };
};

export const fetchServiceUsageError = (error: object) => {
  return {
    type: SERVICE_USAGE_FETCH_ERROR,
    payload: {error},
  };
};

export const serviceProviderSelect = (uuid: string) => {
  return {
    type: SERVICE_SELECT,
    payload: {uuid},
  };
};

export const showFilter = () => {
  return {
    type: FILTER_SHOW,
  };
};

export const hideFilter = () => {
  return {
    type: FILTER_HIDE,
  };
};

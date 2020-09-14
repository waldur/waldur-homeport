export const SERVICE_USAGE_FETCH_START = 'waldur/providers/support/FETCH_START';
export const SERVICE_USAGE_FETCH_DONE = 'waldur/providers/support/FETCH_DONE';
export const SERVICE_USAGE_FETCH_ERROR = 'waldur/providers/support/FETCH_ERROR';
export const SERVICE_SELECT = 'waldur/providers/support/SERVICE_SELECT';
export const INFO_PANEL_SHOW = 'waldur/providers/support/INFO_PANEL_SHOW';
export const INFO_PANEL_HIDE = 'waldur/providers/support/INFO_PANEL_HIDE';
export const USAGE_DATA_CLEAN = 'waldur/providers/support/USAGE_DATA_CLEAN';

export const fetchServiceUsageStart = () => ({
  type: SERVICE_USAGE_FETCH_START,
});

export const fetchServiceUsageDone = (data) => {
  return {
    type: SERVICE_USAGE_FETCH_DONE,
    payload: { data },
  };
};

export const fetchServiceUsageError = (error: object) => {
  return {
    type: SERVICE_USAGE_FETCH_ERROR,
    payload: { error },
  };
};

export const serviceProviderSelect = (uuid: string) => {
  return {
    type: SERVICE_SELECT,
    payload: { uuid },
  };
};

export const showInfoPanel = () => {
  return {
    type: INFO_PANEL_SHOW,
  };
};

export const hideInfoPanel = () => {
  return {
    type: INFO_PANEL_HIDE,
  };
};

export const cleanUsageData = () => {
  return {
    type: USAGE_DATA_CLEAN,
  };
};

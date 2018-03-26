export const serviceUsageSelector = state => {
  return state.serviceUsage.data;
};

export const selectedServiceProviderSelector = state => {
  return state.serviceUsage.selectedServiceProvider;
};

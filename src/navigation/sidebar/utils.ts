const fetchCounters = async options => {
  try {
    const counters = await options.getCounters();
    options.getCountersSuccess(counters);
  } catch (e) {
    options.getCountersError(e);
  }
};

export const connectSidebarCounters = customOptions => {
  // Options should contain following keys:
  // $scope, items, getCounters, getCountersError
  const options = {
    getCounters: () => {
      // It should return promise
      return Promise.reject();
    },
    getCountersError: () => {
      // It may redirect or display message
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getCountersSuccess: (_: Record<string, number>) => {
      // Callback should update parent state.
    },
    ...customOptions,
  };
  fetchCounters(options);
  options.$scope.$on('refreshCounts', () => {
    fetchCounters(options);
  });
};

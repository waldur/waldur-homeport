const getOffering = state => state.marketplace.offering;
export const getStep = state => getOffering(state).step;
export const selectFilterQuery = state => getOffering(state).filterQuery;

const getCategory = state => state.marketplace.category;
export const selectFilterQuery = state => getCategory(state).filterQuery;
export const isLoading = state => getCategory(state).loading;
export const isLoaded = state => getCategory(state).loaded;
export const isErred = state => getCategory(state).erred;
export const getSections = state => getCategory(state).sections;

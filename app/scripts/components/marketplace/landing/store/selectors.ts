const getLanding = state => state.marketplace.landing;
export const getCategories = state => getLanding(state).categories;

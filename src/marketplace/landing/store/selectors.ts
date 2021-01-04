import { RootState } from '@waldur/store/reducers';

const getLanding = (state: RootState) => state.marketplace.landing;
export const getCategories = (state: RootState) => getLanding(state).categories;
export const getOfferings = (state: RootState) => getLanding(state).offerings;

import { RootState } from '@waldur/store/reducers';

export const getResource = (state: RootState, props) =>
  state.resource.summary.resources[props.resolve.url];
export const getLoading = (state: RootState) => state.resource.summary.loading;

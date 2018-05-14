export const getResource = (state, props) => state.resource.summary.resources[props.resolve.url];
export const getLoading = state => state.resource.summary.loading;

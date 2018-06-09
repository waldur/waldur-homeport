export const getOwnerCanRegisterProvider = state => !state.config.disabledFeatures.providers;
export const getOwnerCanRegisterExpert = state => !state.config.disabledFeatures.experts;

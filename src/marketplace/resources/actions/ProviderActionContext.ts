import { createContext, useContext } from 'react';

/**
 * Set around the actions offered to the provider of a resource. An action
 * shared by both sides reads the resource through the provider endpoints there,
 * since the consumer endpoints answer provider-side roles with 404.
 */
export const ProviderActionContext = createContext(false);

export const useIsProviderAction = () => useContext(ProviderActionContext);

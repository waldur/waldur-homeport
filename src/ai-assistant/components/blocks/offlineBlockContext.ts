import { createContext } from 'react';

// Provided by the support/audit log view to suppress live data fetches and
// disable interactive controls. Live (chat drawer) rendering ignores this —
// consumer defaults to `false`.
export const OfflineBlockContext = createContext(false);

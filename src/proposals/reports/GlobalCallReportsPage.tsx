import { ReportsPage } from './ReportsPage';

/** Every call of every call-managing organization: staff and support. */
const SCOPE = { global: true };

/** The call reports in the global Reporting section. */
export const GlobalCallReportsPage = () => <ReportsPage scope={SCOPE} />;

import { setErrorResponseFormatter } from 'waldur-notifications';

import { format } from '@/core/ErrorMessageFormatter';

/**
 * The one piece waldur-notifications can't provide itself: turning an API
 * error into readable text is app-specific (this app's
 * @/core/ErrorMessageFormatter, tied to waldur-auth-core's error-interceptor
 * shape, ENV and @/i18n). Registered here, so every showErrorResponse — the
 * app's and the shared packages' (useManagedMutation in waldur-shell) —
 * formats errors this way.
 */
setErrorResponseFormatter((error) => format(error));

export { NotifyService, useNotify } from 'waldur-notifications';

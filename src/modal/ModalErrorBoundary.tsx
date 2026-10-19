import { ErrorBoundary } from '@sentry/react';
import { FC, ReactNode } from 'react';

import { ErrorMessage } from '@/ErrorMessage';

/** Reports a crash inside a dialog to Sentry and shows the app's fallback. */
export const ModalErrorBoundary: FC<{ children: ReactNode }> = ({
  children,
}) => <ErrorBoundary fallback={ErrorMessage}>{children}</ErrorBoundary>;

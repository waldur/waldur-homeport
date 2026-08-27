import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import { translate } from 'waldur-i18n-runtime';
import { ErrorBoundary, FallbackRender } from 'waldur-telemetry';
import { BaseButton, Card } from 'waldur-ui';

// Portable counterpart to waldur-homeport's own src/ErrorMessage.tsx —
// same shape (title, error message, reload button), without that file's
// illustration asset or table-placeholder layout, neither of which this
// package can reach. Works with no Sentry DSN configured: @sentry/react's
// ErrorBoundary is a real React error boundary on its own (catches the
// render error and shows this fallback) regardless of whether initSentry()
// ran — it only *reports* to Sentry when the SDK is actually initialized.
const renderFallback: FallbackRender = ({ error }) => (
  <Card className="m-6 flex flex-col items-center gap-3 p-8 text-center">
    <p className="text-lg font-semibold">{translate('Something went wrong')}</p>
    <p className="text-sm text-[var(--surface-text-muted)]">
      {(error as Error)?.message}
    </p>
    <BaseButton
      label={translate('Reload')}
      variant="primary"
      size="lg"
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      onClick={() => window.location.reload()}
    />
  </Card>
);

/**
 * Wraps AppShell's page content (not the Sidebar/TopBar chrome around it)
 * so a crash in one page's content shows this fallback in the content area
 * while navigation/UserMenu/theme toggle stay usable — the same
 * chrome-survives-content-crashes split waldur-homeport's own
 * Application.tsx makes between its outer and inner boundaries, just with
 * one boundary here since AppShell has nothing as heavy as that outer
 * Suspense/QueryClient layer to protect separately.
 */
export function ShellErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary fallback={renderFallback}>{children}</ErrorBoundary>;
}

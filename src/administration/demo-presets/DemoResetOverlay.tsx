import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useEffect } from 'react';
import { DemoPresetStatus, demoPresetStatusRetrieve } from 'waldur-js-client';

import { AlertItem, BaseButton, LoadingSpinner } from 'waldur-ui';

import { translate } from '@/i18n';

import { reloadPortal, reloadToLogin } from './reload';
import { useDemoReset } from './resetState';

const POLL_INTERVAL_MS = 3000;

const DEMO_PRESET_STATUS_QUERY_KEY = ['demo-preset-status'];

const isRunning = (status?: DemoPresetStatus) => !status || status.loading;

const DemoResetScreen: FC<{ preset: string }> = ({ preset }) => {
  const { data } = useQuery({
    queryKey: DEMO_PRESET_STATUS_QUERY_KEY,
    queryFn: () => demoPresetStatusRetrieve().then(({ data }) => data),
    // Keeps polling through errors as well: a worker or proxy restart during
    // the load answers with errors for a while.
    refetchInterval: (query) =>
      isRunning(query.state.data) ? POLL_INTERVAL_MS : false,
    retry: false,
    meta: { skipGlobalErrorRedirect: true },
  });

  const erred = !isRunning(data) && data.load?.state === 'erred';

  useEffect(() => {
    // Every account, the caller's included, was replaced: a full reload to
    // the sign-in page drops the old session and loads the new configuration
    // and features.
    if (!isRunning(data) && !erred) {
      reloadToLogin();
    }
  }, [data, erred]);

  const name = data?.load?.preset || preset;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="demo-reset-title"
      data-testid="demo-reset-overlay"
    >
      <div className="flex max-w-120 flex-col items-center gap-4 text-center">
        {erred ? (
          <>
            <AlertItem
              variant="error"
              type="floating"
              title={
                <span id="demo-reset-title">
                  {translate('Loading the demo preset {name} failed', {
                    name,
                  })}
                </span>
              }
              body={
                data.load.error_message ||
                translate('The load stopped without an error message.')
              }
              className="text-left"
            />
            <BaseButton
              variant="tertiary"
              onClick={reloadPortal}
              iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
              label={translate('Back to the portal')}
            />
          </>
        ) : (
          <>
            <LoadingSpinner className="size-10 text-brand" />
            <h1
              id="demo-reset-title"
              className="text-xl font-semibold text-primary"
            >
              {translate('Resetting the demo')}
            </h1>
            <p className="text-secondary">
              {name
                ? translate(
                    'The demo preset {name} is loading. Everyone is signed out; the sign-in page opens when it is ready.',
                    { name },
                  )
                : translate(
                    'A demo preset is loading. Everyone is signed out; the sign-in page opens when it is ready.',
                  )}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Covers the portal while a demo preset loads. The API answers 503 meanwhile,
 * so the page behind it would only show errors.
 */
export const DemoResetOverlay: FC = () => {
  const reset = useDemoReset();
  return reset ? <DemoResetScreen preset={reset.preset} /> : null;
};

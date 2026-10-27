import { ArrowClockwiseIcon, EyeIcon } from '@phosphor-icons/react';
import {
  CSSProperties,
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

import { dismissBootSplash, readSplashBranding } from 'waldur-boot-splash';
import { initBrandTokens } from 'waldur-design-tokens';
import { BaseButton } from 'waldur-ui';

import { lazyComponent } from './core/lazyComponent';
import { translate } from './i18n';
import './BootErrorScreen.css';
import { ModalShell } from './modal/ModalShell';
import { ThemeProvider } from './theme/ThemeProvider';

const ErrorTraceDialog = lazyComponent(() =>
  import('@/ErrorTraceDialog').then((module) => ({
    default: module.ErrorTraceDialog,
  })),
);

/**
 * The Waldur mark, or the deployment's own compact logo once a previous visit
 * has cached it. A logo that fails to load falls back to the mark rather than
 * leaving a broken image on the only thing on screen.
 */
const SplashMark: FunctionComponent<{ logo: string | null }> = ({ logo }) => {
  const [failed, setFailed] = useState(false);
  if (logo && !failed) {
    return (
      <img
        className="boot-splash__logo"
        src={logo}
        alt=""
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="boot-splash__mark" aria-hidden="true">
      <svg viewBox="-0.5 9.5 11 11">
        <path d="m2 10.04v7.98h1.98v2H0v-9.98zm7.96 0v9.98H5.98v-2h1.98v-7.98zm-3.98 3.98v4h-2v-4z" />
      </svg>
    </div>
  );
};

const ErrorState: FunctionComponent<{ error: Error }> = ({ error }) => {
  const branding = readSplashBranding();
  const [show, setShow] = useState(false);
  // Before paint, so the splash never covers the error for a frame.
  useLayoutEffect(() => dismissBootSplash(), []);
  // Boot failed before afterBootstrap() could build the brand ramp, so the
  // primary button would have no colour; seed it from the cached brand.
  useEffect(() => initBrandTokens(branding.color), [branding.color]);
  return (
    <div
      className="boot-splash"
      role="alert"
      style={{ '--boot-brand': branding.color } as CSSProperties}
    >
      <SplashMark logo={branding.logo} />
      <h1 className="boot-splash__title">
        {translate("Couldn't start {name}", { name: branding.name })}
      </h1>
      {error.message ? (
        <p className="boot-splash__message">{error.message}</p>
      ) : null}
      {show && (
        <ModalShell open={show} onHide={() => setShow(false)}>
          {/* @ts-ignore */}
          <ErrorTraceDialog error={error} />
        </ModalShell>
      )}
      <div className="flex flex-wrap justify-center gap-2.5 mt-1.5">
        {/* Not gated on error.stack: the actionable detail lives on
            error.cause, which is often not an Error and so has no
            stack of its own. Gating on it hid the trace in exactly
            the cases where the message alone was not enough to act
            on. */}
        <BaseButton
          variant="tertiary"
          onClick={() => setShow(true)}
          label={translate('Show error trace')}
          iconNode={<EyeIcon weight="bold" />}
        />
        <BaseButton
          variant="primary"
          onClick={() => location.reload()}
          label={translate('Reload')}
          iconNode={<ArrowClockwiseIcon weight="bold" />}
        />
      </div>
    </div>
  );
};

/**
 * The screen shown when the application cannot boot. While it loads, the
 * boot splash (waldur-boot-splash) is shown instead; this replaces it, with the same
 * look (waldur-boot-splash's styles cover .boot-splash for both).
 */
export const BootErrorScreen: FunctionComponent<{ error: Error }> = ({
  error,
}) => (
  <ThemeProvider>
    <ErrorState error={error} />
  </ThemeProvider>
);

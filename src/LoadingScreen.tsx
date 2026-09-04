import { ArrowClockwiseIcon, EyeIcon } from '@phosphor-icons/react';
import { FunctionComponent, useState } from 'react';
import { Modal } from 'react-bootstrap';

import Illustration from '@/images/table-placeholders/undraw_fixing_bugs_w7gi.svg';

import { lazyComponent } from './core/lazyComponent';
import { SubmitButton } from './form/SubmitButton';
import { translate } from './i18n';
import './LoadingScreen.css';
import { ThemeProvider } from './theme/ThemeProvider';

const ErrorTraceDialog = lazyComponent(() =>
  import('@/ErrorTraceDialog').then((module) => ({
    default: module.ErrorTraceDialog,
  })),
);

export const LoadingScreen: FunctionComponent<{
  loading: boolean;
  error?: Error;
}> = ({ loading, error }) => {
  const [show, setShow] = useState(false);
  return (
    <ThemeProvider>
      <div className="loading-screen-container">
        <div className="loading-screen">
          {loading ? (
            <h1 className="loading-title">{translate('Loading assets')}</h1>
          ) : null}
          {error ? (
            <>
              <div style={{ width: '100%' }}>
                <Illustration />
              </div>
              <div className="text-center">
                <h2>{translate('Unable to bootstrap application.')}</h2>

                {show && (
                  <Modal show={show} onHide={() => setShow(false)}>
                    {/* @ts-ignore */}
                    <ErrorTraceDialog error={error} />
                  </Modal>
                )}
                <div className="d-flex gap-4 mt-2">
                  {/* Not gated on error.stack: the actionable detail lives on
                      error.cause, which is often not an Error and so has no
                      stack of its own. Gating on it hid the trace in exactly
                      the cases where the message alone was not enough to act
                      on. */}
                  <SubmitButton
                    submitting={false}
                    type="button"
                    variant="tertiary"
                    onClick={() => setShow(true)}
                    label={translate('Show error trace')}
                    iconNode={<EyeIcon weight="bold" />}
                    iconOnLeft
                  />
                  <SubmitButton
                    submitting={false}
                    type="button"
                    variant="success"
                    onClick={() => location.reload()}
                    label={translate('Reload')}
                    iconNode={<ArrowClockwiseIcon weight="bold" />}
                    iconOnLeft
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </ThemeProvider>
  );
};

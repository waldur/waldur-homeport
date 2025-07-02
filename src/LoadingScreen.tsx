import { ArrowClockwiseIcon, EyeIcon } from '@phosphor-icons/react';
import { FunctionComponent, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

import Illustration from '@waldur/images/table-placeholders/undraw_fixing_bugs_w7gi.svg';

import { lazyComponent } from './core/lazyComponent';
import { translate } from './i18n';
import './LoadingScreen.css';
import { ThemeProvider } from './theme/ThemeProvider';

const ErrorTraceDialog = lazyComponent(() =>
  import('@waldur/ErrorTraceDialog').then((module) => ({
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
                  {error.stack && (
                    <Button variant="btn-default" onClick={() => setShow(true)}>
                      <span className="svg-icon svg-icon-2">
                        <EyeIcon weight="bold" />
                      </span>
                      {translate('Show error trace')}
                    </Button>
                  )}
                  <Button
                    variant="outline btn-success"
                    onClick={() => location.reload()}
                  >
                    <span className="svg-icon svg-icon-2">
                      <ArrowClockwiseIcon weight="bold" />
                    </span>
                    {translate('Reload')}
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </ThemeProvider>
  );
};

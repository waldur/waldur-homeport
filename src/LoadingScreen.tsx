import { ArrowsClockwise, Warning } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { translate } from './i18n';

import './LoadingScreen.css';

export const LoadingScreen: FunctionComponent<{
  loading: boolean;
  error?: Error;
}> = ({ loading, error }) => {
  return (
    <div className="loading-screen-container">
      <div className="loading-screen">
        {loading ? (
          <h1 className="loading-title">{translate('Loading assets')}</h1>
        ) : null}
        {error ? (
          <div className="erred-screen">
            <div className="erred-screen-icon">
              <Warning />
            </div>
            <h1>{translate('Unable to bootstrap application.')}</h1>
            {error.message ? (
              <p className="erred-screen-message">{error.message}</p>
            ) : null}
            <button
              type="button"
              className="btn btn-success text-uppercase"
              onClick={() => {
                location.reload();
              }}
            >
              <span className="svg-icon svg-icon-2">
                <ArrowsClockwise />
              </span>{' '}
              {translate('Retry')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

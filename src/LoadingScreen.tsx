import { FunctionComponent } from 'react';

import { translate } from './i18n';

import './LoadingScreen.css';

export const LoadingScreen: FunctionComponent<{
  loading: boolean;
  error?: Error;
}> = ({ loading, error }) => {
  return (
    <>
      {loading ? (
        <div className="loading-screen-container">
          <div className="loading-screen">
            <h1 className="loading-title">{translate('Loading assets')}</h1>
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="erred-screen center-block">
          <div className="erred-screen-icon">
            <i className="fa fa-exclamation-triangle"></i>
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
            <i className="fa fa-refresh"></i> {translate('Retry')}
          </button>
        </div>
      ) : null}
    </>
  );
};

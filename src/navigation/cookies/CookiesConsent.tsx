import { useState, FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

import { getConsent, setConsent } from './CookiesStorage';

import './CookiesConsent.css';

export const CookiesConsent: FunctionComponent = () => {
  const [accepted, setAccepted] = useState(getConsent() === 'true');

  if (accepted) {
    return null;
  }

  const hideConsent = () => {
    setAccepted(true);
    setConsent('true');
  };

  return (
    <div className="d-flex d-lg-block flex-column bg-dark text-light text-center rounded-0 cookiealert py-5">
      {translate(
        'This website uses cookies to ensure you get the best experience on our website.',
      )}{' '}
      <a
        href="http://cookies.insites.com/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'underline' }}
      >
        {translate('Learn more')}
      </a>
      <button
        type="button"
        className="btn btn-primary d-inline mx-auto ms-lg-5 acceptcookies mt-5 mt-lg-0"
        onClick={hideConsent}
      >
        {translate('I agree')}
      </button>
    </div>
  );
};

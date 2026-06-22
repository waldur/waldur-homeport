import Qs from 'qs';
import { FunctionComponent, useMemo } from 'react';

import { Link } from '@/core/Link';
import { parseMarkdownLinksOnly } from '@/core/sanitize';
import { getQueryString } from '@/core/utils';
import { translate } from '@/i18n';

export const AuthLoginFailed: FunctionComponent = () => {
  const qs = Qs.parse(getQueryString());
  const message = qs?.message;
  // The query string is attacker-controllable and Qs.parse can yield arrays or
  // objects, so render only when message is a plain string. parseMarkdownLinksOnly
  // sanitizes the input and keeps links only (autolinking bare URLs), avoiding
  // spoofable block markup such as images or headings on this anonymous page.
  const safeMessage = useMemo(
    () =>
      typeof message === 'string' ? parseMarkdownLinksOnly(message) : null,
    [message],
  );

  return (
    <div className="middle-box text-center">
      <h3 className="app-title centered">{translate('Login failed')}</h3>
      {safeMessage && (
        <p
          className="mt-3"
          dangerouslySetInnerHTML={{ __html: safeMessage }}
          data-testid="login-failed-message"
        />
      )}
      <p className="mt-3">
        <Link state="login"> &lt; {translate('Back to login')} </Link>
      </p>
    </div>
  );
};

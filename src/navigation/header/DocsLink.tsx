import { FunctionComponent } from 'react';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';

export const DocsLink: FunctionComponent = () => {
  const link = ENV.plugins.WALDUR_CORE.DOCS_URL;
  if (!link) {
    return null;
  }
  return (
    <div className="menu-item">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="menu-link px-3"
      >
        <span className="menu-title">{translate('Documentation')}</span>
      </a>
    </div>
  );
};

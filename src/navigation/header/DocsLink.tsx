import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

export const DocsLink: FunctionComponent = () => {
  const link = ENV.plugins.WALDUR_CORE.DOCS_URL;
  if (!link) {
    return null;
  }
  return (
    <div className="aside-footer flex-column-auto pt-5 pb-7 px-5">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-custom btn-primary w-100"
      >
        {translate('Documentation')}
      </a>
    </div>
  );
};

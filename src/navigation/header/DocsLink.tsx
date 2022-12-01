import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { InlineSVG } from '@waldur/core/svg/InlineSVG';
import { translate } from '@waldur/i18n';

const DocsIcon = require('./DocsIcon.svg');

export const DocsLink: FunctionComponent = () => {
  const link = ENV.plugins.WALDUR_CORE.DOCS_URL;
  if (!link) {
    return null;
  }
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-custom w-100 mt-5 mb-7 px-5 btn-marketplace"
    >
      <InlineSVG path={DocsIcon} svgClassName="btn-icon svg-icon-2" />
      <span className="btn-label">
        {translate('Documentation')} <i className="fa fa-angle-right angle" />
      </span>
    </a>
  );
};

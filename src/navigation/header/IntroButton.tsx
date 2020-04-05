import * as React from 'react';

import { ngInjector } from '@waldur/core/services';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

export const IntroButton = () => {
  if (!isFeatureVisible('intro')) {
    return null;
  }

  const service = ngInjector.get('ncIntroUtils');
  const pageHasIntro = service.pageHasIntro();
  const startIntro = () => service.start();

  if (!pageHasIntro) {
    return null;
  }
  return (
    <a onClick={startIntro}>
      <i className="fa fa-child"></i> {translate('Guide me')}
    </a>
  );
};

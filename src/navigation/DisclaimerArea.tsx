import { FunctionComponent } from 'react';

import { getIconUrl } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { isFeatureVisible } from '@waldur/features/connect';
import { DeploymentFeatures } from '@waldur/FeaturesEnums';

export const DisclaimerArea: FunctionComponent = () => {
  if (!isFeatureVisible(DeploymentFeatures.enable_disclaimer_area)) {
    return null;
  }

  const logo = ENV.plugins.WALDUR_CORE.DISCLAIMER_AREA_LOGO;
  const text = ENV.plugins.WALDUR_CORE.DISCLAIMER_AREA_TEXT;

  if (!logo && !text) {
    return null;
  }

  return (
    <div className="border-top py-6">
      <div className="container-fluid d-flex flex-column flex-md-row align-items-center justify-content-center gap-4 fs-7 text-muted">
        {logo && (
          <img
            src={getIconUrl('disclaimer_area_logo')}
            alt="Disclaimer"
            style={{ maxHeight: 40, objectFit: 'contain' }}
          />
        )}
        {text && <span>{text}</span>}
      </div>
    </div>
  );
};

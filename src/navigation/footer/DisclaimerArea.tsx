import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { getIconUrl } from '@/core/api';
import { ENV } from '@/core/config';
import { isFeatureVisible } from '@/features/connect';
import { DeploymentFeatures } from '@/FeaturesEnums';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';

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
    <div className="border-t-[1px] border-t-secondary py-5">
      <div
        className={classNames(
          PAGE_CONTAINER_CLASSNAME,
          'flex flex-col md:flex-row items-center justify-center gap-5 text-xs text-quaternary',
        )}
      >
        {text && <span>{text}</span>}
        {logo && (
          <img
            src={getIconUrl('disclaimer_area_logo')}
            alt="Disclaimer"
            style={{ maxHeight: 40, objectFit: 'contain' }}
          />
        )}
      </div>
    </div>
  );
};

import { WarningCircleIcon } from '@phosphor-icons/react';

import { RadarIcon } from '@waldur/core/RadarIcon';
import { translate } from '@waldur/i18n';

export const CompleteYourProfileBanner = () => (
  <div className="h-60px bg-body border-bottom">
    <div className="container-fluid d-flex align-items-center h-100">
      <div className="d-flex align-items-center">
        <RadarIcon
          IconComponent={WarningCircleIcon}
          variant="warning"
          className="me-2"
        />

        <p className="mb-0">
          <strong>{translate('Complete your profile.')}</strong>{' '}
          <span className="text-gray-500">
            {translate(
              'To ensure full access to all Waldur features and services please update your profile information to avoid any disruption in service.',
            )}
          </span>
        </p>
      </div>
    </div>
  </div>
);

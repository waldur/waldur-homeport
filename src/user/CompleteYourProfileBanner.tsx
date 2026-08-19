import { WarningCircleIcon } from '@phosphor-icons/react';

import { FeaturedIcon } from '@/core/FeaturedIcon';
import { translate } from '@/i18n';

interface CompleteYourProfileBannerProps {
  /** Name of the page the profile gate turned the user away from, if known. */
  blockedPageLabel?: string;
}

/**
 * Names the page the user was turned away from, and nothing else — what is
 * outstanding is already shown below by AcceptTosWarning and the tab badges.
 */
export const CompleteYourProfileBanner = ({
  blockedPageLabel,
}: CompleteYourProfileBannerProps) => (
  <div className="h-60px bg-body border-bottom" role="status">
    <div className="container-fluid d-flex align-items-center h-100">
      <div className="d-flex align-items-center">
        {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
        <FeaturedIcon
          IconComponent={WarningCircleIcon}
          variant="warning"
          className="me-2"
        />

        <p className="mb-0">
          <strong>
            {blockedPageLabel
              ? translate('{page} is not available yet.', {
                  page: blockedPageLabel,
                })
              : translate('Complete your profile.')}
          </strong>
        </p>
      </div>
    </div>
  </div>
);

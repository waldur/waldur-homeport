import { WarningCircle } from '@phosphor-icons/react';

import { translate } from '@waldur/i18n';

export const CompleteYourProfileBanner = () => (
  <div className="h-60px bg-body border-bottom">
    <div className="container-fluid d-flex align-items-center h-100">
      <div className="d-flex align-items-center">
        <div className="d-flex flex-center w-35px h-35px flex-shrink-0 rounded-circle border border-light-warning me-2">
          <div className="d-flex flex-center w-25px h-25px rounded-circle border border-warning">
            <WarningCircle size={20} weight="bold" className="text-warning" />
          </div>
        </div>
        <p className="mb-0">
          <strong>{translate('Complete your profile.')}</strong>{' '}
          <span className="text-grey-500">
            {translate(
              'Please ensure that all your mandatory profile information is complete.',
            )}
          </span>
        </p>
      </div>
    </div>
  </div>
);

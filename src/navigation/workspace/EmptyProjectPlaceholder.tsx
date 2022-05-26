import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

import './EmptyOrganizationsPlaceholder.scss';

export const EmptyProjectPlaceholder: FunctionComponent = () => (
  <div className="middle-box text-center no-organization-modal">
    <div className="inner-container">
      <div className="circle rounded-circle border-dark">icon</div>
      <h3 className="mb-3">{translate('No project')}.</h3>
      <p className="description mb-7">
        {translate(
          'You are not part of a project. Create a project or request access from your organization administrator.',
        )}
      </p>
    </div>
  </div>
);

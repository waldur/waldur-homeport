import { FunctionComponent } from 'react';
import './EmptyOrganizationsPlaceholder.scss';

import { translate } from '@waldur/i18n';

import { useCreateOrganization } from './utils';

const InitialCreateOrganizationButton = () => {
  const [enabled, onClick] = useCreateOrganization();
  if (!enabled) {
    return null;
  }
  return (
    <button className="btn btn-primary" onClick={onClick as any}>
      {translate('Create organization')}
    </button>
  );
};

export const EmptyOrganizationsPlaceholder: FunctionComponent = () => (
  <div className="middle-box text-center no-organization-modal">
    <div className="inner-container">
      <div className="circle rounded-circle border-dark">icon</div>
      <h3 className="mb-3">{translate('No organization')}.</h3>
      <p className="description mb-7">
        {translate(
          'You are not part of an organisation. Create an organization or request access from your organization administrator.',
        )}
      </p>
      <InitialCreateOrganizationButton />
    </div>
  </div>
);

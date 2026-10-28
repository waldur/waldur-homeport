import { FunctionComponent } from 'react';
import { Offering } from 'waldur-js-client';

import { PublicOfferingComponentsTable } from './PublicOfferingComponentsTable';

interface PublicOfferingComponentsProps {
  offering: Offering;
}

export const PublicOfferingComponents: FunctionComponent<
  PublicOfferingComponentsProps
> = ({ offering }) => {
  return (
    <div className="mb-8" id="components">
      <div>
        <PublicOfferingComponentsTable offering={offering} />
      </div>
    </div>
  );
};

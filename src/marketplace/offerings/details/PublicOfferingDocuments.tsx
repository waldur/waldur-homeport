import { FunctionComponent } from 'react';
import { Offering } from 'waldur-js-client';

import { PublicOfferingDocumentsTable } from './PublicOfferingDocumentsTable';

interface PublicOfferingDocumentsProps {
  offering: Offering;
}

export const PublicOfferingDocuments: FunctionComponent<
  PublicOfferingDocumentsProps
> = ({ offering }) => {
  return (
    <div className="mb-8" id="documents">
      <div>
        <PublicOfferingDocumentsTable offering={offering} />
      </div>
    </div>
  );
};

import { FunctionComponent } from 'react';
import { PublicOfferingDetails } from 'waldur-js-client';

import { FormattedHtml } from '@/core/FormattedHtml';
import { translate } from '@/i18n';
import { LeafletMap } from '@/map/LeafletMap';

interface ProviderLocationTabProps {
  offering: PublicOfferingDetails;
}

export const ProviderLocationTab: FunctionComponent<
  ProviderLocationTabProps
> = (props) => {
  const hasLocation = props.offering.latitude && props.offering.longitude;

  if (!hasLocation) {
    return (
      <h6 className="text-center text-muted my-10">
        {translate('No location available')}
      </h6>
    );
  }
  return (
    <>
      <div className="mb-6">
        {props.offering.vendor_details && (
          <FormattedHtml html={props.offering.vendor_details} />
        )}
      </div>
      <LeafletMap
        latitude={props.offering.latitude}
        longitude={props.offering.longitude}
      />
    </>
  );
};

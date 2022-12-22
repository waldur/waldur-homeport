import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

import { OfferingLink } from '../links/OfferingLink';
import { Offering } from '../types';

interface OfferingCardButtonsOverlayProps {
  offering: Offering;
}

export const OfferingCardButtonsOverlay = (
  props: OfferingCardButtonsOverlayProps,
) => {
  return (
    <div className="buttons-overlay bg-light">
      <div className="d-grid gap-2">
        <OfferingLink
          offering_uuid={props.offering.uuid}
          className="btn btn-sm btn-outline-primary btn-active-primary border border-primary"
        >
          {translate('Deploy')}
        </OfferingLink>
        <Link
          state="public.marketplace-public-offering"
          params={{
            uuid: props.offering.uuid,
          }}
          className="btn btn-primary btn-sm border border-primary"
        >
          {translate('View item')}
        </Link>
      </div>
    </div>
  );
};

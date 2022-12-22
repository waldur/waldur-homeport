import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';

interface OwnProps {
  offering: Offering;
}

export const ServiceProviderOfferingCardButtonsOverlay = (props: OwnProps) => {
  return (
    <div className="buttons-overlay bg-light">
      <div className="d-grid gap-2">
        <Link
          state="marketplace-offering-user"
          params={{ offering_uuid: props.offering.uuid }}
          className="btn btn-sm btn-outline-primary btn-active-primary border border-primary"
        >
          {translate('Deploy')}
        </Link>
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

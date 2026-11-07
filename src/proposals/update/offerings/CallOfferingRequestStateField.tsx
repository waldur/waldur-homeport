import { RequestedOffering } from 'waldur-js-client';

import { translate } from '@/i18n';
import { CallOfferingStateField } from '@/proposals/details/CallOfferingStateField';

/**
 * The request state, and while the provider has not answered, whose answer
 * the call is waiting for: a call cannot be activated before a provider
 * accepts, and only the provider can do that.
 */
export const CallOfferingRequestStateField = ({
  row,
}: {
  row: Pick<RequestedOffering, 'state' | 'provider_name'>;
}) => (
  <div className="flex flex-col items-start gap-1">
    <CallOfferingStateField row={row} />
    {row.state === 'requested' ? (
      <span className="text-quaternary text-xs">
        {row.provider_name
          ? translate('Waiting for {provider}', {
              provider: row.provider_name,
            })
          : translate('Waiting for the provider')}
      </span>
    ) : null}
  </div>
);

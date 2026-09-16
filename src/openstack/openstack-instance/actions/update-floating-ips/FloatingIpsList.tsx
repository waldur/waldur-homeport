import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';

import { FloatingIpRow } from './FloatingIpRow';

interface FloatingIpsListProps {
  fields;
  floatingIps;
  subnets;
  /** Connected, but to IPv6 only -- see the message below. */
  hasOnlyIpv6Subnets?: boolean;
}

export const FloatingIpsList: FC<FloatingIpsListProps> = ({
  floatingIps,
  subnets,
  fields,
  hasOnlyIpv6Subnets,
}) => (
  <>
    {hasOnlyIpv6Subnets ? (
      /* Connected, so the message below would be wrong, but a floating IP
         maps to a fixed IPv4 address and none of these subnets has one. */
      translate(
        'This instance is connected only to IPv6 subnets. Floating IPs are IPv4 only, so there is nothing to attach — an IPv6 instance is reachable on its own address instead.',
      )
    ) : subnets.length === 1 ? (
      /* Process case when placeholder is the only option */
      translate(
        'Instance is not connected to any internal subnets yet. Please connect it to internal subnet first.',
      )
    ) : (
      <>
        {fields.length === 0 ? (
          translate('Instance does not have any floating IPs yet.')
        ) : (
          <table className="table table-borderless mb-1">
            <tbody>
              {fields.map((name, index) => (
                <FloatingIpRow
                  key={index}
                  name={name}
                  subnets={subnets}
                  floatingIps={floatingIps}
                  onRemove={() => fields.remove(index)}
                />
              ))}
            </tbody>
          </table>
        )}

        <ActionButton
          action={() => {
            fields.push({
              floating_ip: true,
            });
          }}
          title={translate('Add')}
          iconNode={<PlusCircleIcon weight="bold" />}
          variant="text-secondary"
        />
      </>
    )}
  </>
);

import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';

import { FloatingIpRow } from './FloatingIpRow';

interface FloatingIpsListProps {
  fields;
  floatingIps;
  subnets;
}

export const FloatingIpsList: FC<FloatingIpsListProps> = ({
  floatingIps,
  subnets,
  fields,
}) => (
  <>
    {subnets.length === 1 ? (
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

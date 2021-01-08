import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { FormSection, WrappedFieldArrayProps } from 'redux-form';

import { translate } from '@waldur/i18n';

import { FloatingIpRow } from './FloatingIpRow';

interface FloatingIpsListProps extends WrappedFieldArrayProps {
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
          <table className="table table-borderless m-b-xs">
            <tbody>
              {fields.map((row, index) => (
                <FormSection name={row} key={index}>
                  <FloatingIpRow
                    row={row}
                    subnets={subnets}
                    floatingIps={floatingIps}
                    onRemove={() => fields.remove(index)}
                  />
                </FormSection>
              ))}
            </tbody>
          </table>
        )}

        <Button
          bsStyle="default"
          onClick={() => {
            fields.push({
              floating_ip: true,
            });
          }}
        >
          <i className="fa fa-plus"></i> {translate('Add')}
        </Button>
      </>
    )}
  </>
);

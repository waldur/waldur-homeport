import { PlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Table } from 'react-bootstrap';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';
import { OpenStackSecurityGroup } from 'waldur-js-client';

import { translate } from '@/i18n';
import { EthernetType } from '@/openstack/types';
import { CompactActionButton } from '@/table/CompactActionButton';

import { HeaderWithTooltip } from './HeaderWithTooltip';
import { RuleRow } from './RuleRow';
import { Rule } from './types';

const DEFAULT_RULE: Rule = {
  ethertype: 'IPv4' as EthernetType,
  protocol: 'tcp',
  direction: 'ingress',
  port_range: { min: -1, max: -1 },
};

export const RulesList: FC<{
  remoteSecurityGroups: OpenStackSecurityGroup[];
}> = ({ remoteSecurityGroups }) => (
  <FieldArray name="rules">
    {({ fields }: FieldArrayRenderProps<Rule, any>) => (
      <>
        <Table bordered>
          <thead>
            <tr>
              <HeaderWithTooltip
                label={translate('Ethertype')}
                tooltip={translate('Ethernet type: IPv4 or IPv6')}
                className="ps-0"
              />
              <HeaderWithTooltip
                label={translate('Direction')}
                tooltip={translate(
                  'Direction of the traffic: Ingress or Egress',
                )}
              />
              <HeaderWithTooltip
                label={translate('Protocol')}
                tooltip={translate('IP protocol: TCP, UDP, ICMP, etc.')}
              />
              <HeaderWithTooltip
                label={translate('Port range')}
                tooltip={translate(
                  'Enter a single port (22) or a port range (5000-6000) or just leave blank for all ports.',
                )}
              />
              <HeaderWithTooltip
                label={translate('CIDR')}
                tooltip={translate(
                  'Remote IP range in CIDR notation (e.g. 0.0.0.0/0).',
                )}
              />
              <HeaderWithTooltip
                label={translate('Remote group')}
                tooltip={translate(
                  'Remote security group to allow traffic from/to.',
                )}
              />
              <HeaderWithTooltip
                label={translate('Description')}
                tooltip={translate('Brief description of the rule.')}
              />
              <th>{translate('Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {fields.length === 0 ? (
              <tr>
                <td className="text-center" colSpan={8}>
                  {translate('Security group does not contain any rule yet.')}
                </td>
              </tr>
            ) : (
              fields.map((name, index) => (
                <RuleRow
                  key={name}
                  name={name}
                  onRemove={() => fields.remove(index)}
                  remoteSecurityGroups={remoteSecurityGroups}
                />
              ))
            )}
          </tbody>
        </Table>
        <CompactActionButton
          action={() => fields.push(DEFAULT_RULE)}
          title={translate('Add rule')}
          iconNode={<PlusIcon weight="bold" />}
          variant="primary"
        />
      </>
    )}
  </FieldArray>
);

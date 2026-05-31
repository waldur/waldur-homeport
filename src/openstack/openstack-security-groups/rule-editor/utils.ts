import {
  SecurityGroupRuleDirectionEnum,
  EthertypeEnum,
} from 'waldur-js-client';

import { isNumericProtocol } from './ProtocolField';
import { SecurityGroupRulesFormData } from './types';

const serializeProtocol = (protocol: string): string => {
  if (protocol === 'any') return '';
  return protocol;
};

const serializePortRange = (
  protocol: string,
  range: { min: number; max: number } | undefined,
): { from_port: number; to_port: number } => {
  // Neutron rejects port range for protocols other than tcp/udp/icmp.
  if (!range || protocol === 'any' || isNumericProtocol(protocol)) {
    return { from_port: -1, to_port: -1 };
  }
  return { from_port: range.min, to_port: range.max };
};

export const serializeRulesPayload = (formData: SecurityGroupRulesFormData) =>
  formData.rules.map(
    ({ protocol, port_range, ethertype, direction, ...rest }) => ({
      ...rest,
      ethertype: ethertype as EthertypeEnum,
      direction: direction as SecurityGroupRuleDirectionEnum,
      protocol: serializeProtocol(protocol),
      ...serializePortRange(protocol, port_range),
    }),
  );

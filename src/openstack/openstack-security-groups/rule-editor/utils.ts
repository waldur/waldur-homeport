import {
  DirectionEnum,
  EthertypeEnum,
  SecurityGroupRuleProtocolEnum,
} from 'waldur-js-client';

import { SecurityGroupRulesFormData } from './types';

export const serializeRulesPayload = (formData: SecurityGroupRulesFormData) =>
  formData.rules.map(
    ({ protocol, port_range, ethertype, direction, ...rest }) => ({
      ...rest,
      ethertype: ethertype as EthertypeEnum,
      direction: direction as DirectionEnum,
      protocol: (protocol === 'any'
        ? ''
        : protocol) as SecurityGroupRuleProtocolEnum,
      from_port: port_range.min,
      to_port: port_range.max,
    }),
  );

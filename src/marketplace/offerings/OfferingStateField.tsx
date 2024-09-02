import { StateIndicator } from '@waldur/core/StateIndicator';

import { Offering } from '../types';

import { ACTIVE, ARCHIVED, DRAFT, PAUSED } from './store/constants';

export const OfferingStateField = ({ offering }: { offering: Offering }) => {
  return (
    <StateIndicator
      label={offering.state}
      variant={
        {
          [DRAFT]: 'light',
          [ACTIVE]: 'success',
          [PAUSED]: 'warning',
          [ARCHIVED]: 'info',
        }[offering.state]
      }
      light
      pill
    />
  );
};

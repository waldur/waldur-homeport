import { FunctionComponent } from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { TranslateProps, withTranslation } from '@waldur/i18n';

import { Offering } from './types';

interface OfferingStateProps extends TranslateProps {
  offering: Pick<Offering, 'state'>;
}

export const PureOfferingState: FunctionComponent<OfferingStateProps> = (
  props,
) =>
  props.offering ? (
    <StateIndicator
      variant={props.offering.state === 'Terminated' ? 'danger' : 'primary'}
      active={props.offering.state === 'Requested'}
      label={props.translate(props.offering.state)}
    />
  ) : null;

export const OfferingState = withTranslation(PureOfferingState);

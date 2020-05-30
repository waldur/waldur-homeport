import * as classNames from 'classnames';
import * as React from 'react';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { OfferingLink } from '@waldur/marketplace/links/OfferingLink';
import { wrapTooltip } from '@waldur/table-react/ActionButton';

import { Offering } from '../types';

interface MobileOfferingCardProps {
  offering: Offering;
}

export const MobileOfferingCard = (props: MobileOfferingCardProps) => (
  <tr className={classNames({ disabled: props.offering.state !== 'Active' })}>
    <td className="img-md">
      {wrapTooltip(
        props.offering.state === 'Paused' && props.offering.paused_reason,
        <OfferingLink offering_uuid={props.offering.uuid}>
          <OfferingLogo src={props.offering.thumbnail} />
        </OfferingLink>,
      )}
    </td>
    <td>
      <h3>
        <OfferingLink offering_uuid={props.offering.uuid}>
          {props.offering.name}
        </OfferingLink>
      </h3>
      <FormattedHtml html={props.offering.description} />
    </td>
  </tr>
);

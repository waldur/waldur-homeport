import * as React from 'react';

import { translate } from '@waldur/i18n';
import { ReferralDetailsButton } from '@waldur/marketplace/referral/ReferralDetailsButton';
import { Offering } from '@waldur/marketplace/types';
import { Field } from '@waldur/resource/summary';

interface ReferralDetailsFieldProps {
  offering: Offering;
}

export const ReferralDetailsField = (props: ReferralDetailsFieldProps) =>
  props.offering.citation_count >= 0 ? (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ marginRight: '10px', marginBottom: '-5px' }}>
        <Field
          label={translate('Referral count')}
          value={props.offering.citation_count}
        />
      </div>
      {props.offering.citation_count > 0 && (
        <ReferralDetailsButton offering={props.offering} />
      )}
    </div>
  ) : null;

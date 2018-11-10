import * as React from 'react';

import { TranslateProps, withTranslation } from '@waldur/i18n';

import { Offering } from './types';

interface OfferingSummaryTabProps extends TranslateProps {
  offering: Offering;
  summary?: string;
}

export const OfferingSummaryTab = withTranslation((props: OfferingSummaryTabProps) => (
  <>
    {props.summary && <p dangerouslySetInnerHTML={{__html: props.summary}}/>}
    <h5>{props.translate('Description')}</h5>
    <textarea
      value={props.offering.issue_description}
      className="form-control h-150"
      readOnly={true}
    />
  </>
));

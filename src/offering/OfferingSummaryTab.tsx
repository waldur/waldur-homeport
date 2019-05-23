import * as React from 'react';
import * as Panel from 'react-bootstrap/lib/Panel';

import { $sanitize } from '@waldur/core/services';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { formatJiraMarkup } from '@waldur/issues/comments/utils';

import { Offering } from './types';

interface OfferingSummaryTabProps extends TranslateProps {
  offering: Offering;
  summary?: string;
}

export const OfferingSummaryTab = withTranslation((props: OfferingSummaryTabProps) => (
  <>
    {props.summary && <p
      className="m-b-md"
      dangerouslySetInnerHTML={{__html: $sanitize(props.summary)}}/>}
    <Panel>
      <Panel.Heading>
        <Panel.Title>
          {props.translate('Description')}
        </Panel.Title>
      </Panel.Heading>
      <Panel.Body>
        <div dangerouslySetInnerHTML={{__html: $sanitize(formatJiraMarkup(props.offering.issue_description))}}/>
      </Panel.Body>
    </Panel>
  </>
));

import * as React from 'react';
import * as Panel from 'react-bootstrap/lib/Panel';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { FormattedJira } from '@waldur/core/FormattedJira';
import { TranslateProps, withTranslation } from '@waldur/i18n';

import { Offering } from './types';

interface OfferingSummaryTabProps extends TranslateProps {
  offering: Offering;
  summary?: string;
}

export const OfferingSummaryTab = withTranslation(
  (props: OfferingSummaryTabProps) => (
    <>
      {props.summary && (
        <p className="m-b-md">
          <FormattedHtml html={props.summary} />
        </p>
      )}
      <Panel>
        <Panel.Heading>
          <Panel.Title>{props.translate('Description')}</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <FormattedJira text={props.offering.issue_description} />
        </Panel.Body>
      </Panel>
    </>
  ),
);

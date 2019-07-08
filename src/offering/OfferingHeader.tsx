import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/services';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { connectAngularComponent } from '@waldur/store/connect';
import { getUser } from '@waldur/workspace/selectors';

import { Field } from './Field';
import { OfferingRuntimeState } from './OfferingRuntimeState';
import { OfferingState } from './OfferingState';
import { Offering } from './types';

interface OfferingHeaderProps extends TranslateProps {
  offering: Offering;
  summary?: string;
  showIssueLink: boolean;
}

export const PureOfferingHeader = (props: OfferingHeaderProps) => (
  <dl className="dl-horizontal resource-details-table col-sm-12">
    <Field label={props.translate('Name')}>
      {props.offering.name}
    </Field>

    <Field label={props.translate('Created')}>
      {formatDateTime(props.offering.created)}
    </Field>

    <Field label={props.translate('State')}>
      <OfferingState offering={props.offering}/>
    </Field>

    {props.offering.marketplace_resource_state && (
      <Field label={props.translate('Runtime state')}>
        <OfferingRuntimeState state={props.offering.marketplace_resource_state}/>
      </Field>
    )}

    <Field label={props.translate('Type')}>
      {props.offering.type_label || props.offering.type}
    </Field>

    <Field label={<><PriceTooltip/>{' '}{props.translate('Price')}</>}>
      {defaultCurrency(props.offering.unit_price)}
    </Field>

    {props.offering.issue_key && (
      <Field label={props.translate('Issue key')}>
        {props.offering.issue_key}
      </Field>
    )}

    {props.offering.issue_status && (
      <Field label={props.translate('Issue status')}>
        {props.offering.issue_status}
      </Field>
    )}

    {props.showIssueLink && (
      <Field label={props.translate('Issue link')}>
        <a href={props.offering.issue_link} target="_blank">
          <i className="fa fa-external-link"/>
          {' '}
          {props.translate('Open in Service Desk')}
        </a>
      </Field>
    )}
  </dl>
);

const mapStateToProps = (state, ownProps) => {
  const offering: Offering = ownProps.offering;
  const currentUser = getUser(state);
  const showIssueLink = offering.issue_link && currentUser && (currentUser.is_staff || currentUser.is_support);
  return {showIssueLink};
};

const enhance = compose(connect(mapStateToProps), withTranslation);

export const OfferingHeader = enhance(PureOfferingHeader);

export default connectAngularComponent(OfferingHeader, ['offering', 'summary']);

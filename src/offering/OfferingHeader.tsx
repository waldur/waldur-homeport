import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { ResourceDetailsTable } from '@waldur/resource/summary/ResourceDetailsTable';
import { RootState } from '@waldur/store/reducers';
import { getUser } from '@waldur/workspace/selectors';

import { Field } from './Field';
import { OfferingRuntimeState } from './OfferingRuntimeState';
import { OfferingState } from './OfferingState';
import { Offering } from './types';

interface OfferingHeaderOwnProps {
  offering: Offering;
  summary?: string;
}

interface OfferingHeaderProps extends OfferingHeaderOwnProps, TranslateProps {
  showIssueLink: boolean;
}

export const PureOfferingHeader: FunctionComponent<OfferingHeaderProps> = (
  props,
) => (
  <ResourceDetailsTable>
    <Field label={props.translate('Name')}>{props.offering.name}</Field>

    <Field label={props.translate('Created')}>
      {formatDateTime(props.offering.created)}
    </Field>

    <Field label={props.translate('State')}>
      <OfferingState offering={props.offering} />
    </Field>

    {props.offering.marketplace_resource_state && (
      <Field label={props.translate('Runtime state')}>
        <OfferingRuntimeState
          state={props.offering.marketplace_resource_state}
        />
      </Field>
    )}

    <Field label={props.translate('Type')}>
      {props.offering.type_label || props.offering.type}
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

    {props.offering.error_message && (
      <Field label={props.translate('Error message')}>
        {props.offering.error_message}
      </Field>
    )}

    {props.showIssueLink && (
      <Field label={props.translate('Issue link')}>
        <a
          href={props.offering.issue_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fa fa-external-link" />{' '}
          {props.translate('Open in Service Desk')}
        </a>
      </Field>
    )}

    {props.offering.backend_id && (
      <Field label={props.translate('Backend ID')}>
        {props.offering.backend_id}
      </Field>
    )}
  </ResourceDetailsTable>
);

const mapStateToProps = (state: RootState, ownProps) => {
  const offering: Offering = ownProps.offering;
  const currentUser = getUser(state);
  const showIssueLink =
    offering.issue_link &&
    currentUser &&
    (currentUser.is_staff || currentUser.is_support);
  return { showIssueLink };
};

const enhance = compose(connect(mapStateToProps), withTranslation);

export const OfferingHeader = enhance(
  PureOfferingHeader,
) as FunctionComponent<OfferingHeaderOwnProps>;

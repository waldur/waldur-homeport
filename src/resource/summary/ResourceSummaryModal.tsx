import { Component } from 'react';
import { connect } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { BaseResource } from '@waldur/resource/types';

import * as actions from './actions';
import { ResourceSummary } from './ResourceSummary';
import { getResource, getLoading } from './selectors';

interface PureResourceSummaryModalProps {
  loading: boolean;
  resolve: {
    url: string;
  };
  resource: BaseResource;
  fetchResource(): void;
}

export class PureResourceSummaryModal extends Component<PureResourceSummaryModalProps> {
  componentDidMount() {
    this.props.fetchResource();
  }

  render() {
    const { resource, loading } = this.props;
    return (
      <ModalDialog
        title={translate('Details')}
        footer={<CloseDialogButton label={translate('Close')} />}
      >
        {loading ? (
          <LoadingSpinner />
        ) : (
          resource && <ResourceSummary resource={resource} />
        )}
      </ModalDialog>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  resource: getResource(state, ownProps),
  loading: getLoading(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResource: (): void =>
    dispatch(actions.summaryResourceFetch(ownProps.resolve.url)),
});

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const ResourceSummaryModal = enhance(PureResourceSummaryModal);

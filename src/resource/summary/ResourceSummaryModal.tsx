import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { BaseResource } from '@waldur/resource/types';
import { connectAngularComponent } from '@waldur/store/connect';

import * as actions from './actions';
import { ResourceSummary } from './ResourceSummary';
import { getResource, getLoading } from './selectors';

interface PureResourceSummaryModalProps extends TranslateProps {
  loading: boolean;
  resolve: {
    url: string;
  };
  resource: BaseResource;
  fetchResource(): void;
}

export class PureResourceSummaryModal extends React.Component<
  PureResourceSummaryModalProps
> {
  componentDidMount() {
    this.props.fetchResource();
  }

  render() {
    const { resource, translate, loading } = this.props;
    return (
      <ModalDialog title={translate('Details')} footer={<CloseDialogButton />}>
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

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation,
);

export const ResourceSummaryModal = enhance(PureResourceSummaryModal);

export default connectAngularComponent(ResourceSummaryModal, ['resolve']);

import * as React from 'react';
import { connect } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { closeModalDialog } from '@waldur/modal/actions';
import { connectAngularComponent } from '@waldur/store/connect';

import './IssueAttachmentModal.scss';
import * as utils from './utils';

interface PureIssueAttachmentModalProps {
  closeModal(): void;
  resolve: {
    url: string;
  };
}

export class PureIssueAttachmentModal extends React.Component<PureIssueAttachmentModalProps> {
  state = {
    loading: true,
  };

  render() {
    const { closeModal, resolve: { url } } = this.props;

    return (
      <div className="attachment-modal">
        <div className="attachment-modal__close" onClick={closeModal}>
          <i className="fa fa-times" aria-hidden="true" />
        </div>
        <div className="modal-header">
          <div className="modal-title">
            <h3><a href={url} download="true">{utils.getFileName(url)}</a></h3>
          </div>
        </div>
        <div className="modal-body attachment-modal__img">
          {this.state.loading ? <LoadingSpinner /> : null}
          <img
            className={this.state.loading ? 'hidden' : null}
            src={url}
            onLoad={() => this.setState({ loading: false })}
          />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  closeModal: (): void => dispatch(closeModalDialog()),
});

export const IssueAttachmentModal = connect(null, mapDispatchToProps)(PureIssueAttachmentModal);

export default connectAngularComponent(IssueAttachmentModal, ['resolve']);

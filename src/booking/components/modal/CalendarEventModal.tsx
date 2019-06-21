import { EventInput } from '@fullcalendar/core';
import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import * as Modal from 'react-bootstrap/lib/Modal';

import { translate } from '@waldur/i18n';

interface CalendarEventModalProps {
  title: string;
  isOpen: boolean;
  onSuccess: (event) => void;
  closeModal: () => void;
}

export class CalendarEventModal extends React.Component<CalendarEventModalProps, EventInput> {

  constructor(props) {
    super(props);
    const { event } = props.modalProps;
    this.state = {
      title: event && event.title || '',
      start: event && event.start,
      end: event && event.end,
      allDay: event && event.allDay,
    };
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit() {
    const { props, state } = this;
    const { closeModal, onSuccess } = props;
    onSuccess(state);
    closeModal();
  }

  render() {
    const { props } = this;
    return (
      <Modal show={props.isOpen} onHide={props.closeModal}>
        <Modal.Header>
          <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <form className="form-horizontal">

          <div>
            <div className="form-group">
              <label className="control-label col-md-3">{translate('Title')}</label>
              <div className="col-md-9">
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={this.state.title}
                  onChange={e => this.handleChange(e)}/>
              </div>
            </div>
          </div>

        </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => props.closeModal()}>{translate('Dismiss')}</Button>
          <Button bsStyle="primary" onClick={() => this.handleSubmit()}>{translate('Submit')}</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

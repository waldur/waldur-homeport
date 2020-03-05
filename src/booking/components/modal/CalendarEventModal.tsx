import {EventInput} from '@fullcalendar/core';
import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import * as Modal from 'react-bootstrap/lib/Modal';

import {AddCalendarEvent} from '@waldur/booking/components/AddCalendarEvent';
import {translate} from '@waldur/i18n';
import {FormGroup} from '@waldur/marketplace/offerings/FormGroup';

interface CalendarEventModalProps {
  title: string;
  isOpen: boolean;
  onSuccess: (event) => void;
  closeModal: () => void;
  modalProps: {
    deleteBooking: () => void;
    event: EventInput & {
      extendedProps: {
        type: string;
      };
    };
  };
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
  handleDelete() {
    this.props.modalProps.deleteBooking();
    this.props.closeModal();
  }
  handleSubmit() {
    this.props.onSuccess({ ...this.state });
    this.props.closeModal();
  }
  handleChange(name, value) {
    this.setState(prevState => ({ ...prevState, [name]: value}));
  }

  render() {
    const { closeModal, isOpen, modalProps } = this.props;

    return (
      <Modal show={isOpen} onHide={closeModal}>
        <Modal.Header style={{ backgroundColor: '#1ab394', color: '#f3f3f4' }}>
          <h2 className="col-sm-offset-2 col-sm-9">
            {modalProps.event.extendedProps.type === 'availability' ? translate('Edit availability') : translate('Edit booking')}
          </h2>
        </Modal.Header>
        <Modal.Body>
          <form className="form-horizontal">

            <AddCalendarEvent
              showAllDay={true}
              useTime={true}
              event={modalProps.event}
              setBooking={({event}) => this.setState( pS => ({...pS, event}))}>
              <FormGroup
                label={translate('Title')}
                labelClassName="control-label col-sm-2"
                valueClassName="col-sm-9">
                <input
                  name="title"
                  type="text"
                  className="form-control"
                  value={this.state.title}
                  onChange={({target}) => this.handleChange(target.name, target.value)}/>
              </FormGroup>
            </AddCalendarEvent>

            <div className="row" style={{marginTop: 30}}>
              <Button type="button" className="col-sm-offset-2 col-sm-2 btn-delete" onClick={() => this.handleDelete()}>
                {translate('Delete')}
              </Button>
              <Button type="button" className="col-sm-offset-1 col-sm-2" onClick={closeModal}>
                {translate('Cancel')}
              </Button>
              <Button type="button" className="col-sm-offset-1 col-sm-2" bsStyle="primary" onClick={() => this.handleSubmit()}>
                {translate('Save')}
              </Button>

            </div>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

import { EventInput } from '@fullcalendar/core';
import * as moment from 'moment';
import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import * as Modal from 'react-bootstrap/lib/Modal';

import { DateAndTimeSelectField } from '@waldur/booking/components/modal/DateAndTimeSelect';
import { translate } from '@waldur/i18n';

interface CalendarEventModalProps {
  title: string;
  isOpen: boolean;
  onSuccess: (event) => void;
  closeModal: () => void;
  modalProps: {
    destroy(): void;
    event: EventInput & {
      extendedProps: {
        type: string;
      };
    };
  };
}

export class CalendarEventModal extends React.Component<
  CalendarEventModalProps,
  EventInput
> {
  constructor(props) {
    super(props);
    const { event } = props.modalProps;
    this.state = {
      title: (event && event.title) || '',
      start: event && event.start,
      end: event && event.end,
      allDay: event && event.allDay,
    };
  }

  handleDelete() {
    this.props.modalProps.destroy();
    this.props.closeModal();
  }

  handleSubmit() {
    this.props.onSuccess({ ...this.state });
    this.props.closeModal();
  }

  handleChange(name, value) {
    this.setState(prevState => ({ ...prevState, [name]: value }));
  }

  render() {
    const {
      props: {
        closeModal,
        isOpen,
        modalProps: { event },
      },
      state: { title, start, end, allDay },
    } = this;

    return (
      <Modal show={isOpen} onHide={closeModal}>
        <Modal.Header style={{ backgroundColor: '#1ab394', color: '#f3f3f4' }}>
          <h2 className="col-sm-offset-2 col-sm-9">
            {event.extendedProps.type === 'availability'
              ? translate('Create an availability')
              : translate('Edit booking event')}
          </h2>
        </Modal.Header>
        <Modal.Body>
          <form className="form-horizontal">
            <div className="form-group">
              <label className="control-label col-sm-2">
                {translate('Title')}
              </label>
              <div className="col-sm-9">
                <input
                  name="title"
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={e =>
                    this.handleChange(e.target.name, e.target.value)
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label className="control-label col-sm-2">
                {translate('All day')}
              </label>
              <div className="col-sm-9" style={{ paddingTop: 7 }}>
                <div className="checkbox-toggle">
                  <input
                    id="AllDay"
                    type="checkbox"
                    checked={allDay}
                    onChange={() =>
                      this.setState(prevState => ({
                        allDay: !prevState.allDay,
                      }))
                    }
                  />
                  <label htmlFor="AllDay">Allday toggle</label>
                </div>
              </div>
            </div>

            <DateAndTimeSelectField
              name="start"
              minuteStep={30}
              label={translate('Start')}
              isDisabled={allDay}
              currentTime={moment.utc(start, 'DD/MM/YYYY HH:mm', true)}
              onChange={newDateValue =>
                this.handleChange('start', newDateValue)
              }
            />

            <DateAndTimeSelectField
              name="end"
              label={translate('End')}
              minuteStep={30}
              isDisabled={allDay}
              currentTime={moment.utc(end, 'DD/MM/YYYY HH:mm', true)}
              onChange={newDateValue => this.handleChange('end', newDateValue)}
            />

            <div className="row" style={{ marginTop: 30 }}>
              <Button
                className="col-sm-offset-2 col-sm-2 btn-delete"
                style={{ borderColor: 'transparent' }}
                onClick={() => this.handleDelete()}
              >
                {translate('Delete')}
              </Button>
              <Button
                className="col-sm-offset-1 col-sm-2"
                style={{ borderColor: 'transparent' }}
                onClick={closeModal}
              >
                {translate('Cancel')}
              </Button>
              <Button
                className="col-sm-offset-1 col-sm-2"
                bsStyle="primary"
                onClick={() => this.handleSubmit()}
              >
                {translate('Save')}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

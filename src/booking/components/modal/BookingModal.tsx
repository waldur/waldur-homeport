import moment from 'moment-timezone';
import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import * as ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import * as Modal from 'react-bootstrap/lib/Modal';

import { BookingModalProps } from '@waldur/booking/types';
import { translate } from '@waldur/i18n';

import { DateAndTimeSelectField } from './DateAndTimeSelect';

const BookingModal = ({
  isOpen,
  toggle,
  onSuccess,
  onDelete,
  event,
}: BookingModalProps) => {
  const [newEvent, setNewEvent] = React.useState({
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
  });

  const handleDelete = () => {
    onDelete();
    toggle();
  };
  const handleSubmit = () => {
    const payload = {
      ...event,
      ...newEvent,
    };
    onSuccess(payload);
    toggle();
  };
  const handleChange = (name, value) =>
    setNewEvent({ ...newEvent, [name]: value });

  return (
    <Modal show={isOpen} onHide={toggle}>
      <Modal.Header>
        <h2 className="col-sm-push-2 col-sm-9">
          {event.extendedProps.type === ('availability' || 'Availability')
            ? translate('Edit an availability')
            : translate('Edit booking event')}
        </h2>
        <button
          type="button"
          className="close"
          aria-label="Close"
          onClick={toggle}
        >
          <span aria-hidden="true" style={{ padding: '1rem' }}>
            &times;
          </span>
        </button>
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
                value={newEvent.title}
                onChange={({ target }) =>
                  handleChange(target.name, target.value)
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
                  checked={newEvent.allDay}
                  onChange={() => handleChange('allDay', !newEvent.allDay)}
                />
                <label htmlFor="AllDay">All-day toggler</label>
              </div>
            </div>
          </div>

          <DateAndTimeSelectField
            name="start"
            minuteStep={30}
            label={translate('Start')}
            isDisabled={newEvent.allDay}
            currentTime={moment(newEvent.start, 'DD/MM/YYYY HH:mm', true)}
            onChange={newDateValue => handleChange('start', newDateValue)}
          />

          <DateAndTimeSelectField
            name="end"
            label={translate('End')}
            minuteStep={30}
            isDisabled={newEvent.allDay}
            currentTime={moment(newEvent.end, 'DD/MM/YYYY HH:mm', true)}
            onChange={newDateValue => handleChange('end', newDateValue)}
          />

          <ButtonGroup
            style={{
              display: 'flex',
              justifyContent: 'center',
              justifyItems: 'center',
              marginTop: 30,
            }}
          >
            <Button bsStyle="danger btn-outline" onClick={handleDelete}>
              {translate('Delete')}
            </Button>
            <Button bsStyle="primary btn-outline" onClick={handleSubmit}>
              {translate('Save')}
            </Button>
          </ButtonGroup>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default BookingModal;

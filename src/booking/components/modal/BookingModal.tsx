import moment from 'moment-timezone';
import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import * as ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import * as Modal from 'react-bootstrap/lib/Modal';
import { useDispatch } from 'react-redux';

import { BookingModalProps, BookingProps } from '@waldur/booking/types';
import { translate } from '@waldur/i18n';
import { showError } from '@waldur/store/coreSaga';

import { DateAndTimeSelectField } from './DateAndTimeSelect';

const BookingModal = ({
  isOpen,
  toggle,
  onSuccess,
  onDelete,
  event,
}: BookingModalProps) => {
  const dispatch = useDispatch();
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
    if (moment(newEvent.start).isBefore(newEvent.end)) {
      const { id, extendedProps } = event;
      const payload = {
        oldID: id as BookingProps['id'],
        event: {
          id,
          extendedProps,
          ...newEvent,
        },
      };
      onSuccess(payload);
      toggle();
    } else {
      dispatch(showError(translate('End date must be after start date.')));
    }
  };
  const handleChange = (name, value) =>
    setNewEvent({ ...newEvent, [name]: value });

  return (
    <Modal show={isOpen} onHide={toggle}>
      <Modal.Header style={{ backgroundColor: '#19b394' }}>
        <Modal.Title style={{ color: 'white', paddingLeft: 12 }}>
          {event.extendedProps.type === ('availability' || 'Availability')
            ? translate('Edit an availability')
            : translate('Edit booking event')}
          <button
            type="button"
            className="close"
            aria-label="Close"
            onClick={toggle}
            style={{ color: 'white', fontSize: 22 }}
          >
            <span aria-hidden="true" style={{ padding: '1rem' }}>
              &times;
            </span>
          </button>
        </Modal.Title>
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
            onChange={(newDateValue) => handleChange('start', newDateValue)}
          />

          <DateAndTimeSelectField
            name="end"
            label={translate('End')}
            minuteStep={30}
            isDisabled={newEvent.allDay}
            currentTime={moment(newEvent.end, 'DD/MM/YYYY HH:mm', true)}
            onChange={(newDateValue) => handleChange('end', newDateValue)}
          />

          <ButtonGroup
            style={{
              display: 'flex',
              justifyContent: 'center',
              justifyItems: 'center',
              marginTop: 30,
            }}
          >
            <Button bsStyle="delete" onClick={handleDelete}>
              {translate('Delete')}
            </Button>
            <Button bsStyle="primary" onClick={handleSubmit}>
              {translate('Save')}
            </Button>
          </ButtonGroup>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default BookingModal;

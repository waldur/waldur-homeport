import {EventInput} from '@fullcalendar/core';
import {DateInput} from '@fullcalendar/core/datelib/env';
import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import * as Modal from 'react-bootstrap/lib/Modal';

import {PureDateField} from '@waldur/booking/components/PureDateField';
import {translate} from '@waldur/i18n';
import {FormGroup} from '@waldur/marketplace/offerings/FormGroup';

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
      }
    }
  };
}

export class CalendarEventModal extends React.Component<CalendarEventModalProps, EventInput> {

  constructor(props) {
    super(props);
    const { event } = props.modalProps;
    this.state = {
      title: event && event.title || '',
      start: event && event.start as DateInput,
      end: event && event.end as DateInput,
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
    this.setState(prevState => ({ ...prevState, [name]: value}));
  }

  render() {
    const { closeModal, isOpen, modalProps: {event} } = this.props;
    const { start, end, allDay, title } = this.state;
    return (
      <Modal show={isOpen} onHide={closeModal}>
        <Modal.Header style={{backgroundColor: '#1ab394', color: '#f3f3f4'}}>
          <h2 className="col-sm-offset-2 col-sm-9">
            {event.extendedProps.type === 'availability' ? translate('Edit availability') : translate('Edit booking')}
          </h2>
        </Modal.Header>
        <Modal.Body>
          <form className="form-horizontal">
            <FormGroup label={translate('Start')} labelClassName="control-label col-sm-2">
              <PureDateField
                name="start"
                value={start}
                onChange={newValue => this.handleChange('start', newValue)}
                withTime={{isDisabled: allDay}}/>
            </FormGroup>
            <FormGroup label={translate('End')} labelClassName="control-label col-sm-2">
              <PureDateField
                name="end"
                value={end}
                onChange={newValue => this.handleChange('end', newValue)}
                withTime={{ isDisabled: allDay}}/>
            </FormGroup>
            <FormGroup label={translate('Title')} labelClassName="control-label col-sm-2" valueClassName="col-sm-9">
              <input
                name="title"
                type="text"
                className="form-control"
                value={title}
                onChange={({target}) => this.handleChange(target.name, target.value)}/>
            </FormGroup>
            <FormGroup label="All Day" labelClassName="control-label col-sm-2" valueClassName="col-sm-offset-1">
              <div className="checkbox-toggle">
                <input
                  id="AllDay"
                  type="checkbox"
                  checked={allDay}
                  onChange={() => this.handleChange('allDay', !allDay) }
                  />
                <label style={{marginTop: 5, marginLeft: 30}} htmlFor="AllDay">Allday weekends</label>
              </div>
            </FormGroup>
            <div className="row" style={{marginTop: 30}}>
              <Button
                className="col-sm-offset-2 col-sm-2 btn-delete"
                style={{borderColor: 'transparent'}}
                onClick={() => this.handleDelete()}>
                {translate('Delete')}
              </Button>
              <Button
                className="col-sm-offset-1 col-sm-2"
                style={{borderColor: 'transparent'}}
                onClick={closeModal}>
                {translate('Cancel')}
              </Button>
              <Button
                className="col-sm-offset-1 col-sm-2"
                bsStyle="primary"
                onClick={() => this.handleSubmit()}>
                {translate('Save')}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

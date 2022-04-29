import { FunctionComponent } from 'react';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';

import { translate } from '@waldur/i18n/translate';

import { SupportEventsListFilter } from './SupportEventsListFilter';

export const EventFilterButton: FunctionComponent = () => (
  <OverlayTrigger
    trigger="click"
    placement="bottom"
    overlay={
      <Popover>
        <Popover.Body>
          <SupportEventsListFilter />
        </Popover.Body>
      </Popover>
    }
  >
    <Button variant="light" className="me-3">
      <i className="fa fa-filter" />
      {translate('Filter')}
    </Button>
  </OverlayTrigger>
);

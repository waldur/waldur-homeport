import * as classNames from 'classnames';
import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { Panel } from '@waldur/core/Panel';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';

const SelectOfferingButton = ({ value, onChange }) => (
  <a
    className={classNames(
      'btn btn-xs btn-block-sm btn-block-md btn-outline',
      value ? 'btn-primary' : 'btn-default',
    )}
    onClick={onChange}
  >
    {' '}
    {value ? translate('Selected') : translate('Select')}{' '}
    <i
      className={classNames('fa', value ? 'fa-check' : 'fa-long-arrow-right')}
    />
  </a>
);

const OfferingItem = ({ offering, value, onChange, id }) => (
  <Panel className="provider-box cursor-pointer">
    <div className="m-md">
      <Tooltip label={offering.name} id={id}>
        <a className="h5 ellipsis">{offering.name}</a>
      </Tooltip>
    </div>
    <div className="text-center m-b m-t">
      <OfferingLogo src={offering.thumbnail} size="small" />
    </div>
    <div className="text-center">
      <SelectOfferingButton
        value={value === offering}
        onChange={() => onChange(value)}
      />
    </div>
  </Panel>
);

export const OfferingsList = ({ choices, value, onChange }) => (
  <Row>
    {choices.map((offering, index) => (
      <Col key={index} md={3} xs={6} sm={4} onClick={() => onChange(offering)}>
        <OfferingItem
          id={index}
          value={value}
          onChange={onChange}
          offering={offering}
        />
      </Col>
    ))}
  </Row>
);

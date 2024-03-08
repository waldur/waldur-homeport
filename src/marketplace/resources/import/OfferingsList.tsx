import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Panel } from '@waldur/core/Panel';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';

const SelectOfferingButton = ({ value, onChange }) => (
  <button
    className={classNames(
      'btn btn-block-sm btn-block-md btn-outline',
      value ? 'btn-primary' : 'btn-secondary',
    )}
    type="button"
    onClick={onChange}
  >
    {' '}
    {value ? translate('Selected') : translate('Select')}{' '}
    <i
      className={classNames('fa', value ? 'fa-check' : 'fa-long-arrow-right')}
    />
  </button>
);

const OfferingItem = ({ offering, value, onChange, id }) => (
  <Panel className="provider-box cursor-pointer">
    <div className="m-md">
      <Tip label={offering.name} id={id}>
        <div className="h5 ellipsis">{offering.name}</div>
      </Tip>
    </div>
    <div className="text-center m-b m-t">
      <OfferingLogo src={offering.thumbnail} size="sm" />
    </div>
    <div className="text-center">
      <SelectOfferingButton
        value={value === offering}
        onChange={() => onChange(value)}
      />
    </div>
  </Panel>
);

export const OfferingsList: FunctionComponent<{ choices; value; onChange }> = ({
  choices,
  value,
  onChange,
}) => (
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

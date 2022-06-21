import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface MapInfoPanelProps {
  onPanelClose(): void;
  data: any;
}

export const MapInfoPanel = ({ data, onPanelClose }: MapInfoPanelProps) => (
  <div id="flow-map-panel">
    <Card>
      <Card.Header>
        <Card.Title>
          <h3>{translate('Provider')}</h3>
        </Card.Title>
        <div className="card-toolbar">
          <a className="close-link me-1" onClick={onPanelClose}>
            <i className="fa fa-times" />
          </a>
        </div>
      </Card.Header>
      <Card.Body className="text-center">
        <div className="mb-2">
          <img
            alt="image"
            className="img-fluid rounded-circle"
            src={data.logo}
          />
        </div>
        <h3 className="font-bold">{data.name}</h3>

        <div className="text-center">
          <p>{data.description}</p>
        </div>
        <hr />
        <h3>
          {translate('Used in the period {period} by:', {
            period: data.consumers[0].period,
          })}
        </h3>
      </Card.Body>
      {data.consumers.map((consumer, index) => {
        return (
          <Card.Body key={index}>
            <h4 className="font-bold">{consumer.name}</h4>
            <div>
              <div>
                CPU
                <small className="pull-right">
                  {consumer.cpu} {translate('hours')}
                </small>
              </div>
              <div>
                RAM
                <small className="pull-right">
                  {consumer.ram} {translate('hours')}
                </small>
              </div>
              <div>
                GPU
                <small className="pull-right">
                  {consumer.gpu} {translate('hours')}
                </small>
              </div>
            </div>
          </Card.Body>
        );
      })}
    </Card>
  </div>
);

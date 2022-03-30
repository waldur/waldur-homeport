import { Card } from 'react-bootstrap';

import { withTranslation, TranslateProps } from '@waldur/i18n';

interface MapInfoPanelProps extends TranslateProps {
  onPanelClose(): void;
  data: any;
}

export const MapInfoPanel = withTranslation(
  ({ data, onPanelClose, translate }: MapInfoPanelProps) => (
    <div id="flow-map-panel">
      <Card>
        <Card.Header>
          <h5>{translate('Provider')}</h5>
          <div className="card-tools">
            <a className="close-link m-r-xs" onClick={onPanelClose}>
              <i className="fa fa-times" />
            </a>
          </div>
        </Card.Header>
        <Card.Body className="text-center">
          <div className="m-b-sm">
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
  ),
);

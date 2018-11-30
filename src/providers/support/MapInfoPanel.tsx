import * as React from 'react';

import { withTranslation, TranslateProps } from '@waldur/i18n';

interface MapInfoPanelProps extends TranslateProps {
  onPanelClose(): void;
  data: any;
}

export const MapInfoPanel = withTranslation(({ data, onPanelClose, translate }: MapInfoPanelProps) => (
  <div id="flow-map-panel">
    <div className="ibox">
      <div className="ibox-title">
          <h5>{translate('Provider')}</h5>
          <div className="ibox-tools">
              <a className="close-link m-r-xs" onClick={onPanelClose}>
                  <i className="fa fa-times"/>
              </a>
          </div>
      </div>
      <div className="ibox-content text-center">
        <div className="m-b-sm">
          <img alt="image" className="img-responsive img-circle" src={data.logo}/>
        </div>
        <h3 className="font-bold">{data.name}</h3>

        <div className="text-center">
          <p>{data.description}</p>
        </div>
        <hr/>
        <h3>{translate('Used in the period')} -</h3>
        <h4>{data.consumers[0].period}</h4>
        <h3>{translate('by')}:</h3>
      </div>
      {data.consumers.map((consumer, index) => {
        return (
          <div key={index} className="ibox-content">
            <h4 className="font-bold">{consumer.name}</h4>
            <div>
              <div>
                CPU
                <small className="pull-right">{consumer.cpu} {translate('hours')}</small>
              </div>
              <div>
                RAM
                <small className="pull-right">{consumer.ram} {translate('hours')}</small>
              </div>
              <div>
                GPU
                <small className="pull-right">{consumer.gpu} {translate('hours')}</small>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
));

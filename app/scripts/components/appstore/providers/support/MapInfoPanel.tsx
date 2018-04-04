import * as React from 'react';

export const MapInfoPanel = ({data, onPanelClose}) => {
  return (
    <div className="ibox">
      <div className="ibox-title">
          <h5>Provider</h5>
          <div className="ibox-tools">
              <a className="close-link m-r-xs" onClick={onPanelClose}>
                  <i className="fa fa-times"/>
              </a>
          </div>
      </div>
      <div className="ibox-content text-center">
        <div className="m-b-sm">
          <img alt="image" className="img-circle" src={data.logo}/>
        </div>
        <h3 className="font-bold">{data.name}</h3>

        <div className="text-center">
          <p>{data.description}</p>
        </div>
        <hr/>
        <h3>Used in the period -</h3>
        <h4>{data.consumers[0].data.period}</h4>
        <h3>by:</h3>
      </div>
      {data.consumers.map((consumer, index) => {
        return (
          <div key={index} className="ibox-content">
            <h4 className="font-bold">{consumer.name}</h4>
            <div>
              <div>
                <span>CPU</span>
                <small className="pull-right">{consumer.data.cpu} hours</small>
              </div>
              <div>
                <span>RAM</span>
                <small className="pull-right">{consumer.data.ram} hours</small>
              </div>
              <div>
                <span>GPU</span>
                <small className="pull-right">{consumer.data.gpu} hours</small>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

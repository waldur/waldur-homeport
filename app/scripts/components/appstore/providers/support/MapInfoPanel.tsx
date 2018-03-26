import * as React from 'react';

export const MapInfoPanel = ({data}) => {
  return (
    <div className="ibox">
      <div className="ibox-content text-center">
        <div className="m-b-sm">
          <img alt="image" className="img-circle" src={data.logo}/>
        </div>
        <h3 className="font-bold">{data.name}</h3>

        <div className="text-center">
          <p>{data.description}</p>
        </div>
        <hr/>
        <h3>Used by:</h3>
      </div>
      {data.consumers.map((consumer, index) => {
        return (
          <div key={index} className="ibox-content">
            <h4 className="font-bold">{consumer.name}</h4>
            <div>
              <div>
                <span>Period</span>
                <small className="pull-right">{consumer.data.period}</small>
              </div>
              <div>
                <span>Cpu</span>
                <small className="pull-right">{consumer.data.cpu} hours</small>
              </div>
              <div>
                <span>Ram</span>
                <small className="pull-right">{consumer.data.ram} hours</small>
              </div>
              <div>
                <span>Gpu</span>
                <small className="pull-right">{consumer.data.gpu} hours</small>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

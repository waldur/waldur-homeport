import * as React from 'react';

type Props = {
  title: string,
  children: React.ReactNode,
};

const Panel = ({ title, children }: Props) => (
  <div className='ibox'>
    <div className='ibox-title'>
      <h5>{title}</h5>
    </div>
    <div className='ibox-content'>
      {children}
    </div>
  </div>
);

export default Panel;

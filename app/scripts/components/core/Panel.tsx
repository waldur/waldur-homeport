import * as React from 'react';

type Props = {
  title: string;
  className?: string;
  children: React.ReactNode;
  titleAppendix?: React.ReactNode;
};

const Panel = ({ title, children, className, titleAppendix }: Props) => (
  <div className={'ibox ' + className}>
    <div className='ibox-title'>
      <h5>{title}</h5>
      {titleAppendix}
    </div>
    <div className='ibox-content'>
      {children}
    </div>
  </div>
);

export default Panel;

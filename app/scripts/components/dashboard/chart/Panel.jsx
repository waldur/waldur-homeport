import React from 'react';

export const Panel = ({ title, children }) =>
  <div className='ibox'>
    <div className='ibox-title'>
      <h5>{title}</h5>
    </div>
    <div className='ibox-content'>
      {children}
    </div>
  </div>

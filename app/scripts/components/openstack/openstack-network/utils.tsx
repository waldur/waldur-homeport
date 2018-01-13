import * as React from 'react';

export const formatAllocationPool = pools =>
  pools.length === 0 ? '―' :
  pools.map((pool, index) => <div key={index}>{pool.start} ― {pool.end}</div>);

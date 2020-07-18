import * as React from 'react';

const getAllocationPool = (subnetCidr) => {
  const prefix = subnetCidr.split('.').slice(0, 3).join('.');
  return `${prefix}.10 - ${prefix}.200`;
};

export const OpenstackAllocationPool = ({ model, field }) =>
  model[field.parentField] ? (
    <div className="form-control-static">
      {getAllocationPool(model[field.parentField])}
    </div>
  ) : (
    <div className="form-control-static">&mdash;</div>
  );

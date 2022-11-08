import React from 'react';

export const TableFilter: React.FunctionComponent<{
  filters: React.ReactNode;
}> = ({ filters }) => {
  return (
    <div className="d-flex scroll-x">
      <div className="d-flex align-items-stretch text-nowrap w-100">
        {filters}
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';

import { translate } from '@waldur/i18n';

export const FinishStepWrapper = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, 200);
  });

  return (
    <>
      <h2 className="mb-10">{translate('Success')}</h2>
      <div className="success-step d-flex h-75">
        <i
          className={
            'fa fa-check-circle text-success m-auto ' + (show && 'show')
          }
        ></i>
      </div>
    </>
  );
};

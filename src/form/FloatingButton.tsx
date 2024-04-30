import classNames from 'classnames';
import { FC, PropsWithChildren, useRef } from 'react';

import useOnScreen from '@waldur/core/useOnScreen';

import './FloatingButton.scss';

export const FloatingButton: FC<PropsWithChildren> = (props) => {
  const mainButtonRef = useRef(null);
  const isOnScreen = useOnScreen(mainButtonRef);

  return (
    <>
      <div ref={mainButtonRef} className="d-flex justify-content-between mt-5">
        {props.children}
      </div>
      <div
        className={classNames(
          'floating-button d-xl-none',
          !isOnScreen && 'active',
        )}
      >
        {props.children}
      </div>
    </>
  );
};

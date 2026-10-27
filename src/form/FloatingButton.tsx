import classNames from 'classnames';
import { FC, PropsWithChildren, useRef } from 'react';

import useOnScreen from '@/core/useOnScreen';

import './FloatingButton.scss';

export const FloatingButton: FC<PropsWithChildren> = (props) => {
  const mainButtonRef = useRef(null);
  const isOnScreen = useOnScreen(mainButtonRef);

  return (
    <>
      <div ref={mainButtonRef} className="flex justify-between mt-4">
        {props.children}
      </div>
      <div
        className={classNames(
          'floating-button xl:hidden',
          !isOnScreen && 'active',
        )}
      >
        {props.children}
      </div>
    </>
  );
};

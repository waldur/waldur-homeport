import { FC, useRef } from 'react';
import { Button } from 'react-bootstrap';

import useOnScreen from '@waldur/core/useOnScreen';

interface SubmitButtonProps {
  title: string;
  onClick?(): void;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
}

export const SubmitButton: FC<SubmitButtonProps> = (props) => {
  const mainButtonRef = useRef(null);
  const isOnScreen = useOnScreen(mainButtonRef);

  const buttonJsx = (
    <Button
      size="sm"
      variant="primary"
      type="submit"
      disabled={props.disabled || props.loading}
      onClick={props.onClick}
      className={props.className}
    >
      {props.loading && <i className="fa fa-spinner fa-spin me-1" />}
      {props.title}
    </Button>
  );

  return (
    <>
      <div ref={mainButtonRef} className="d-flex justify-content-between mt-5">
        {buttonJsx}
      </div>
      <div
        className={
          'floating-submit-button d-xl-none' +
          (!isOnScreen ? ' active' : undefined)
        }
      >
        {buttonJsx}
      </div>
    </>
  );
};

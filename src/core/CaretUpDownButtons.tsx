import classNames from 'classnames';

import { CaretDownSmallIcon, CaretUpSmallIcon } from 'waldur-ui';

interface CaretUpDownButtonsProps {
  onClickUp?: React.MouseEventHandler<HTMLButtonElement>;
  onClickDown?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  upClassName?: string;
  downClassName?: string;
  upTestId?: string;
  downTestId?: string;
  upLabel: string;
  downLabel: string;
}

export const CaretUpDownButtons = (props: CaretUpDownButtonsProps) => {
  return (
    <span
      className={classNames(
        'inline-flex flex-col align-middle *:flex',
        props.className,
      )}
    >
      <button
        type="button"
        data-testid={props.upTestId}
        onClick={props.onClickUp}
        aria-label={props.upLabel}
        className={classNames(
          'bg-transparent border-0 p-0 m-0 cursor-pointer inline text-quaternary hover:text-primary',
          props.upClassName,
        )}
      >
        <CaretUpSmallIcon />
      </button>
      <button
        type="button"
        data-testid={props.downTestId}
        onClick={props.onClickDown}
        aria-label={props.downLabel}
        className={classNames(
          'bg-transparent border-0 p-0 m-0 cursor-pointer inline text-quaternary hover:text-primary',
          props.downClassName,
        )}
      >
        <CaretDownSmallIcon />
      </button>
    </span>
  );
};

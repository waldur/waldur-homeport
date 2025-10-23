import classNames from 'classnames';

interface CaretUpDownButtonsProps {
  onClickUp?: React.MouseEventHandler<HTMLButtonElement>;
  onClickDown?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  upClassName?: string;
  downClassName?: string;
  upTestId?: string;
  downTestId?: string;
}

export const CaretUpDownButtons = (props: CaretUpDownButtonsProps) => {
  return (
    <span className={classNames('up-down-buttons', props.className)}>
      <button
        type="button"
        data-testid={props.upTestId}
        onClick={props.onClickUp}
        className={classNames('text-btn', props.upClassName)}
      >
        <svg width="16" height="8" fill="currentColor" viewBox="0 0 256 128">
          <path d="M 126 45 l 39.51 39.52 a 12 12 0 0 0 17 -17 l -48 -48 a 12 12 0 0 0 -17 0 l -48 48 a 12 12 0 0 0 17 17 Z" />
        </svg>
      </button>
      <button
        type="button"
        data-testid={props.downTestId}
        onClick={props.onClickDown}
        className={classNames('text-btn', props.downClassName)}
      >
        <svg width="16" height="8" fill="currentColor" viewBox="0 0 256 128">
          <path d="M 184.49 39.51 a 12 12 0 0 1 0 17 l -48 48 a 12 12 0 0 1 -17 0 l -48 -48 a 12 12 0 0 1 17 -17 L 128 79 l 39.51 -39.52 A 12 12 0 0 1 184.49 39.51 Z" />
        </svg>
      </button>
    </span>
  );
};

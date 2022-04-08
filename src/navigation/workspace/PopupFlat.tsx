import classNames from 'classnames';
import { FunctionComponent, ReactNode } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

interface PopupFlatProps {
  groupId: string;
  items: ReactNode[];
  cols?: 1 | 2 | 3;
  placement?: 'right' | 'left' | 'top' | 'bottom';
  className?: string;
}

const popoverClickRootClose: FunctionComponent<PopupFlatProps> = ({
  groupId,
  items,
  cols = 1,
  className,
}) => {
  const col =
    items.length === 1
      ? 1
      : items.length === 2 && cols >= 2
      ? 2
      : items.length > 2 && cols > 2
      ? cols
      : 1;
  return (
    <Popover id={groupId} className={classNames('popover-metro', className)}>
      {items.map((item, i) => (
        <div key={i} className={'tile tile-' + col}>
          {item}
        </div>
      ))}
    </Popover>
  );
};

export const PopupFlat: FunctionComponent<PopupFlatProps> = (props) => (
  <OverlayTrigger
    trigger="click"
    rootClose
    placement={props.placement}
    overlay={popoverClickRootClose(props)}
  >
    {props.children}
  </OverlayTrigger>
);

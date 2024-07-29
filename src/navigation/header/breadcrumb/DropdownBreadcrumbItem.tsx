import { CaretDown } from '@phosphor-icons/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { TruncatedText } from '@waldur/core/TruncatedText';
import { IBreadcrumbItem } from '@waldur/navigation/types';

import { BreadcrumbItem } from './BreadcrumbItem';

export const DropdownBreadcrumbItem = ({ item }: { item: IBreadcrumbItem }) => {
  const [show, setShow] = useState(false);
  const handleClickOutside = useCallback(
    (e) => {
      const popup = document.getElementById(`BreadcrumbPopover-${item.key}`);
      if (!popup || !popup.contains(e.target)) {
        setShow(false);
      }
    },
    [setShow],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const refItem = useRef<HTMLLIElement>();

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom"
      show={show}
      overlay={
        <Popover
          id={`BreadcrumbPopover-${item.key}`}
          className="mw-400px min-w-200px py-2"
        >
          {show &&
            (typeof item.dropdown === 'function'
              ? item.dropdown(() => setShow(false))
              : item.dropdown)}
        </Popover>
      }
      rootClose={true}
    >
      <BreadcrumbItem
        ref={refItem}
        key={item.key}
        to={item.to}
        params={item.params}
        ellipsis={item.ellipsis}
        active={item.active}
        onClick={() => setShow((v) => !v)}
      >
        {item.truncate && item.text.length > 4 ? (
          <TruncatedText
            text={item.text}
            padding={item.hideDropdownArrow ? 25 : 50}
          />
        ) : (
          item.text
        )}{' '}
        {!item.hideDropdownArrow && (
          <CaretDown size={18} className="svg-icon" />
        )}
      </BreadcrumbItem>
    </OverlayTrigger>
  );
};

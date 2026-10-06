import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import {
  ComponentPropsWithoutRef,
  forwardRef,
  MouseEvent,
  PointerEvent,
  useContext,
} from 'react';

import { compose, HoverContext } from './hoverContext';

export const MenuTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ onMouseEnter, onMouseLeave, onPointerDown, ...props }, ref) => {
  const hover = useContext(HoverContext)?.trigger;
  return (
    <DropdownMenuPrimitive.Trigger
      ref={ref}
      onMouseEnter={compose<MouseEvent<HTMLButtonElement>>(
        onMouseEnter,
        hover?.onMouseEnter,
      )}
      onMouseLeave={compose<MouseEvent<HTMLButtonElement>>(
        onMouseLeave,
        hover?.onMouseLeave,
      )}
      onPointerDown={compose<PointerEvent<HTMLButtonElement>>(
        onPointerDown,
        hover?.onPointerDown,
      )}
      {...props}
    />
  );
});
MenuTrigger.displayName = 'Menu.Trigger';

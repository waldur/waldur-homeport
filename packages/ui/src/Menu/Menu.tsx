import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ComponentPropsWithoutRef, useState } from 'react';

import { HoverContext, useHoverOpen } from './hoverContext';
import { MenuCheckboxItem } from './MenuCheckboxItem';
import { MenuContent } from './MenuContent';
import { MenuCopyItem } from './MenuCopyItem';
import { MenuItem } from './MenuItem';
import { MenuLabel } from './MenuLabel';
import { MenuRadioItem } from './MenuRadioItem';
import { MenuSeparator } from './MenuSeparator';
import { MenuSub, MenuSubContent, MenuSubTrigger } from './MenuSub';
import { MenuTrigger } from './MenuTrigger';
import { MenuTriggerButton } from './MenuTriggerButton';

export { MenuPopover } from './MenuPopover';

/**
 * The one menu component: Radix DropdownMenu with the app's looks and
 * defaults built in, so callers don't repeat them.
 *
 * - `modal={false}`, a Portal (with an optional `container`), the look's
 *   z-index layer, scrolling inside the space Radix measures, `sideOffset`
 *   2 and the keyframe entrance.
 * - The look (`nav` or `actions`) and row options live in React context
 *   (menuContext.tsx), so rows in submenus inherit them through portals.
 * - `openOnHover` opens the menu on pointer hover (`"desktop"`: only at the
 *   `lg` breakpoint and up, clicking below it), which Radix's Trigger
 *   doesn't support on its own.
 *
 * ```tsx
 * <Menu openOnHover="desktop">
 *   <Menu.Trigger asChild><button>Offerings</button></Menu.Trigger>
 *   <Menu.Content look="nav" side="bottom" align="start">
 *     <Menu.Item onSelect={…}>All offerings</Menu.Item>
 *     <Menu.Separator />
 *     <Menu.CheckboxItem checked={dark} onCheckedChange={setDark}>Dark theme</Menu.CheckboxItem>
 *   </Menu.Content>
 * </Menu>
 * ```
 */

export type MenuRootProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Root
> & {
  /** Open on pointer hover; `"desktop"`: only at `lg` and up. */
  openOnHover?: boolean | 'desktop';
};

// A separate component so that only hover menus subscribe to the viewport
// width. `open` may still be controlled, e.g. to close the menu on Tab.
const HoverMenuRoot = ({
  openOnHover,
  open: controlledOpen,
  onOpenChange,
  ...props
}: MenuRootProps & { openOnHover: true | 'desktop' }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  const handlers = useHoverOpen(openOnHover, open, setOpen);
  return (
    <HoverContext.Provider value={handlers}>
      <DropdownMenuPrimitive.Root
        {...props}
        open={open}
        onOpenChange={setOpen}
      />
    </HoverContext.Provider>
  );
};

const MenuRoot = ({ openOnHover, modal = false, ...props }: MenuRootProps) =>
  openOnHover ? (
    <HoverMenuRoot openOnHover={openOnHover} modal={modal} {...props} />
  ) : (
    <DropdownMenuPrimitive.Root modal={modal} {...props} />
  );

export const Menu = Object.assign(MenuRoot, {
  Trigger: MenuTrigger,
  TriggerButton: MenuTriggerButton,
  Content: MenuContent,
  Item: MenuItem,
  Group: DropdownMenuPrimitive.Group,
  RadioGroup: DropdownMenuPrimitive.RadioGroup,
  RadioItem: MenuRadioItem,
  CheckboxItem: MenuCheckboxItem,
  CopyItem: MenuCopyItem,
  Sub: MenuSub,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
  Label: MenuLabel,
  Separator: MenuSeparator,
});

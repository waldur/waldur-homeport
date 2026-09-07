import { useRouter } from '@uirouter/react';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

/**
 * forwardRef because this is rendered under `ActionsDropdownItem asChild`:
 * Radix's Slot clones this component and attaches the ref its menu
 * collection uses for arrow-key navigation and typeahead. A plain function
 * component silently drops that ref ("Function components cannot be given
 * refs") and the row becomes unreachable from the keyboard.
 */
export const DropdownLink = forwardRef<
  HTMLAnchorElement,
  { state: string; params?: object } & ComponentPropsWithoutRef<'a'>
>(({ state, params, ...rest }, ref) => {
  // This component ensures that dropdown is hidden when state transition is triggered
  const router = useRouter();
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a
      ref={ref}
      {...rest}
      onClick={() => {
        setTimeout(() => {
          router.stateService.go(state, params);
        }, 100);
      }}
      aria-hidden="true"
    />
  );
});
DropdownLink.displayName = 'DropdownLink';

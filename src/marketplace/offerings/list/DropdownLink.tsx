import { useRouter } from '@uirouter/react';
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';

/**
 * forwardRef because this is rendered under `Menu.Item asChild`:
 * Radix's Slot clones this component and attaches the ref its menu
 * collection uses for arrow-key navigation and typeahead. A plain function
 * component silently drops that ref ("Function components cannot be given
 * refs") and the row becomes unreachable from the keyboard.
 */
export const DropdownLink = forwardRef<
  HTMLAnchorElement,
  {
    state: string;
    params?: object;
    icon?: ReactNode;
  } & ComponentPropsWithoutRef<'a'>
>(({ state, params, icon, children, ...rest }, ref) => {
  // This component ensures that dropdown is hidden when state transition is triggered
  const router = useRouter();
  const content = icon ? (
    <>
      <span className="menu-item-icon inline-flex shrink-0 items-center justify-center size-[20px] me-[12px] [&>svg]:size-[20px] leading-none">
        {icon}
      </span>
      <span className="menu-item-label flex-1 min-w-0">{children}</span>
    </>
  ) : (
    children
  );

  return (
    <a
      ref={ref}
      {...rest}
      onClick={() => {
        setTimeout(() => {
          router.stateService.go(state, params);
        }, 100);
      }}
      aria-hidden="true"
    >
      {content}
    </a>
  );
});
DropdownLink.displayName = 'DropdownLink';

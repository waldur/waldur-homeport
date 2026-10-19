import { DotsThreeIcon } from '@phosphor-icons/react';
import { Slot } from '@radix-ui/react-slot';
import { ComponentPropsWithoutRef, forwardRef } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { cn } from '../cn';

/**
 * Breadcrumb container (<nav aria-label="breadcrumb">).
 */
export const BreadcrumbRoot = forwardRef<
  HTMLElement,
  ComponentPropsWithoutRef<'nav'>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    aria-label="breadcrumb"
    data-slot="breadcrumb"
    className={cn('min-w-0', className)}
    {...props}
  />
));
BreadcrumbRoot.displayName = 'Breadcrumb';

/**
 * Breadcrumb ordered list (<ol>).
 */
export const BreadcrumbList = forwardRef<
  HTMLOListElement,
  ComponentPropsWithoutRef<'ol'>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    data-slot="breadcrumb-list"
    className={cn(
      'flex flex-wrap items-center gap-1.5 break-words text-sm text-quaternary list-none p-0 m-0',
      className,
    )}
    {...props}
  />
));
BreadcrumbList.displayName = 'BreadcrumbList';

/**
 * Breadcrumb list item (<li>).
 */
export const BreadcrumbItem = forwardRef<
  HTMLLIElement,
  ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-slot="breadcrumb-item"
    className={cn(
      'inline-flex items-center gap-1.5 min-w-0 text-sm',
      className,
    )}
    {...props}
  />
));
BreadcrumbItem.displayName = 'BreadcrumbItem';

/**
 * Breadcrumb link (<a> or custom component via asChild).
 */
export const BreadcrumbLink = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<'a'> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      ref={ref}
      data-slot="breadcrumb-link"
      className={cn(
        'text-brand hover:underline transition-colors focus-visible:outline-brand focus-visible:rounded-sm',
        className,
      )}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

/**
 * Active / current breadcrumb page item. Not a link: it is the page the user
 * is on, so it only carries aria-current.
 */
export const BreadcrumbPage = forwardRef<
  HTMLSpanElement,
  ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="breadcrumb-page"
    aria-current="page"
    className={cn('font-normal text-quaternary cursor-default', className)}
    {...props}
  />
));
BreadcrumbPage.displayName = 'BreadcrumbPage';

/**
 * Separator between breadcrumb items.
 * Uses Waldur's 20x20 diagonal slash line by default.
 */
export const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<'li'>) => (
  <li
    role="presentation"
    aria-hidden="true"
    data-slot="breadcrumb-separator"
    className={cn('shrink-0 flex items-center text-quinary', className)}
    {...props}
  >
    {children ?? (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-5 shrink-0"
        aria-hidden="true"
      >
        <line
          x1="6.26358"
          y1="18.4759"
          x2="14.0116"
          y2="1.86025"
          stroke="currentColor"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

/**
 * Ellipsis indicator for collapsed breadcrumb segments. The icon is hidden
 * from assistive technology; `label` (translated "More" by default) is what
 * a screen reader announces in its place.
 */
export const BreadcrumbEllipsis = ({
  className,
  label,
  ...props
}: ComponentPropsWithoutRef<'span'> & { label?: string }) => (
  <span
    data-slot="breadcrumb-ellipsis"
    className={cn('flex size-9 items-center justify-center', className)}
    {...props}
  >
    <DotsThreeIcon weight="bold" className="size-4" aria-hidden="true" />
    <span className="sr-only">{label ?? translate('More')}</span>
  </span>
);
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

// Compound component support
export const Breadcrumb = Object.assign(BreadcrumbRoot, {
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Page: BreadcrumbPage,
  Separator: BreadcrumbSeparator,
  Ellipsis: BreadcrumbEllipsis,
});

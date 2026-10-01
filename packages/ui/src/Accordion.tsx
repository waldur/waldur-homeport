import { CaretDownIcon } from '@phosphor-icons/react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';

import { cn } from './cn';
import { unscrollPanel } from './unscrollPanel';

/**
 * shadcn's Accordion recipe (https://ui.shadcn.com/docs/components/accordion)
 * on Radix Accordion, replacing react-bootstrap's Accordion. Radix gives the
 * header a real <button> inside a heading, aria-expanded/aria-controls,
 * arrow/Home/End keys between headers, and `type="multiple"` for groups
 * where several panels stay open (the table filters sidebar).
 *
 * The open header is `brand-700` (`brand-200` in dark), the runtime tenant
 * colour — Bootstrap's version baked in the build-time default green. The
 * chevron is an icon in `currentColor`, so it always matches the header.
 *
 * A closed panel's children are unmounted (Radix renders `isOpen &&
 * children`). Fine for display content; for form fields that must keep
 * their values while collapsed, use Collapsible with `keepMounted`.
 */
export const Accordion = AccordionPrimitive.Root;

export const AccordionItem = forwardRef<
  ElementRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      'border-b border-[var(--surface-card-border)] last:border-b-0',
      className,
    )}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

export interface AccordionTriggerProps extends ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Trigger
> {
  /** Classes for the heading element wrapping the trigger button. */
  headerClassName?: string;
}

export const AccordionTrigger = forwardRef<
  ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, headerClassName, children, ...props }, ref) => (
  // Radix renders an <h3>; reset Bootstrap/Metronic heading margin and type
  // so the trigger's own classes decide the look.
  <AccordionPrimitive.Header
    className={cn('m-0 flex [font:inherit]', headerClassName)}
  >
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'group flex flex-1 items-center justify-between gap-4 px-6 py-5 text-left',
        'text-sm font-semibold text-[var(--surface-text-primary)]',
        'transition-colors hover:bg-[var(--surface-hover-bg)]',
        'data-[state=open]:bg-[var(--surface-hover-bg)] data-[state=open]:text-brand-700 dark:data-[state=open]:text-brand-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
      <CaretDownIcon
        size={16}
        weight="bold"
        aria-hidden="true"
        className="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = forwardRef<
  ElementRef<typeof AccordionPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, onScroll, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    data-waldur-animated=""
    onScroll={(event) => {
      unscrollPanel(event);
      onScroll?.(event);
    }}
    className={cn(
      'text-sm text-[var(--surface-text-primary)]',
      // Accordion's Content is Collapsible's under the hood, so Radix sets
      // --radix-collapsible-content-height here too. The keyframes clip
      // (overflow: hidden) only while animating, so an open panel lets a
      // select's menu overflow it — see animations.css.
      'data-[state=open]:animate-[waldur-collapsible-down_250ms_ease-out]',
      'data-[state=closed]:animate-[waldur-collapsible-up_250ms_ease-out]',
    )}
    {...props}
  >
    <div className={cn('px-6 pt-2 pb-5', className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = 'AccordionContent';

import { FC, PropsWithChildren, ReactNode, useState } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { ButtonCaret } from './ButtonCaret';
import { cn } from './cn';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './Collapsible';

export interface AccordionCardProps extends PropsWithChildren {
  title: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  id?: string;
  className?: string;
  titleClassName?: string;
  defaultOpen?: boolean;
  /** Controlled open state - when provided, component becomes controlled */
  isOpen?: boolean;
  /** Callback when accordion is toggled - required for controlled mode */
  onToggle?: (isOpen: boolean) => void;
  /** Header on a tinted strip spanning the card's full width. */
  solid?: boolean;
  /** Compact header and body, smaller muted title. */
  secondary?: boolean;
  /** Slim header and body, for cards nested in dialogs. */
  size?: 'sm';
}

/**
 * A card whose body folds away under its header, on waldur-ui's Radix
 * Collapsible. `keepMounted`: several cards wrap react-final-form fields,
 * which must keep their values and validation while folded.
 *
 * Tailwind port of the Metronic `.card.card-bordered` it used to render.
 * Spacing is in rem, as Metronic's was (`$card-px` 1.85rem, `$card-py`
 * 1.23rem), so it keeps scaling with the app's responsive root font size;
 * colours come from the `--surface-*` / `--card-*` tokens in
 * waldur-design-tokens/surfaceColors.css.
 */
export const AccordionCard: FC<AccordionCardProps> = (props) => {
  const isControlled = props.isOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    Boolean(props.defaultOpen),
  );
  const open = isControlled ? props.isOpen : uncontrolledOpen;

  const onOpenChange = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    props.onToggle?.(next);
  };

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} keepMounted>
      <div
        id={props.id}
        className={cn(
          // min-w-0: as Bootstrap's .card, so a card in a flex/grid row can
          // shrink and let wide content scroll instead of widening it.
          'flex min-w-0 flex-col rounded-[8px] border border-solid border-[var(--surface-card-border)] bg-bg-primary',
          props.solid && 'overflow-hidden',
          props.secondary && 'pb-[4px]',
          props.size === 'sm' && 'py-[0.307rem]',
          props.className,
        )}
      >
        <div
          className={cn(
            'flex flex-nowrap items-center justify-between text-[length:14px] font-bold text-[color:var(--card-header-text)]',
            'mx-[1.85rem] min-h-[70px] pt-[1.85rem] pb-[1.23rem]',
            open && 'border-b border-solid border-[var(--surface-card-border)]',
            props.solid &&
              'mx-0 min-h-[48px] bg-[var(--card-header-solid-bg)] px-[1.85rem] text-[length:1.077rem] text-[color:var(--card-title-text)]',
            props.secondary &&
              'mx-[1.23rem] min-h-[42px] pt-[calc(0.923rem-1px)] pb-[calc(0.615rem-1px)]',
            props.size === 'sm' && 'mx-[1.23rem] min-h-[36px] p-0',
          )}
        >
          {/* The title is the control, not the whole header: a header that
              is itself a button cannot legally contain the buttons `actions`
              place inside it. The title grows to fill the strip up to the
              toolbar, so the clickable area covers the header. */}
          <CollapsibleTrigger className="grow border-0 bg-transparent p-0 text-start text-inherit">
            <span
              className={cn(
                'block text-[length:1.25rem] leading-[1.2] font-semibold text-[color:var(--card-title-text)]',
                // leading after the size: tailwind-merge drops an earlier
                // leading-* when a later text-* size overrides the font size.
                props.secondary &&
                  'text-[length:1.077rem] leading-[1.2] text-[color:var(--card-title-secondary-text)]',
                props.titleClassName,
              )}
            >
              {props.title}
            </span>
            {props.subtitle && (
              <small className="mt-[0.5rem] block text-[length:1.077rem] font-normal text-[color:var(--surface-text-secondary)]">
                {props.subtitle}
              </small>
            )}
          </CollapsibleTrigger>
          <div className="my-[4px] ml-[0.5rem] flex items-center gap-[0.924rem] self-start">
            {Boolean(props.actions) && (
              <div className="flex gap-[0.924rem]">{props.actions}</div>
            )}
            {/* Bare on purpose: a tooltip on every caret in the app would be
                noise. */}
            <CollapsibleTrigger
              className="flex border-0 bg-transparent p-0 text-inherit"
              aria-label={translate('Toggle')}
            >
              <ButtonCaret isOpen={open} />
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent>
          <div
            className={cn(
              'px-[1.85rem] py-[1.23rem]',
              props.secondary &&
                'px-[1.23rem] pt-[1.23rem] pb-[calc(0.923rem-4px)]',
              props.size === 'sm' && 'p-[1.23rem] pb-[0.923rem]',
            )}
          >
            {props.children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

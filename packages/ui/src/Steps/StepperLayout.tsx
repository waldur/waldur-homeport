import { FC, HTMLAttributes } from 'react';

import { cn } from '../cn';

type PartProps = HTMLAttributes<HTMLDivElement>;

/**
 * The page of a long, single-page form: a header, the steps (`Body`) and,
 * beside them from xl, a sticky column (`Aside`) for the step nav and the
 * summary; below xl the column follows the steps.
 *
 * The column sticks below whatever sticks above the page, read from two CSS
 * variables the app's chrome sets on an ancestor:
 * - `--layout-sticky-top`: where sticky content sticks inside its scroller
 *   (default `0px`).
 * - `--layout-sticky-height`: how tall the scroller's visible area is there
 *   (default `100vh` less `--layout-sticky-top`, right when the window
 *   scrolls; an app that scrolls an inner pane sets it, as `AppShell` does).
 *
 * The parts draw no page frame (side padding, maximum width): the app passes
 * its own through `className`.
 */
const Container: FC<PartProps> = ({ className, ...props }) => (
  <div
    data-slot="stepper-layout"
    className={cn(
      '[--stepper-sticky-top:var(--layout-sticky-top,0px)]',
      '[--stepper-sticky-height:var(--layout-sticky-height,calc(100vh_-_var(--stepper-sticky-top)))]',
      'flex flex-col xl:flex-row gap-4 pb-8',
      className,
    )}
    {...props}
  />
);

const Header: FC<PartProps> = ({ className, ...props }) => (
  <div
    data-slot="stepper-layout-header"
    className={cn('flex py-6.5', className)}
    {...props}
  />
);

const Body: FC<PartProps> = ({ className, ...props }) => (
  <div
    data-slot="stepper-layout-body"
    className={cn('flex flex-col lg:flex-auto lg:min-w-0 gap-4', className)}
    {...props}
  />
);

/**
 * The side column: 10px below the sticky top, as tall as the space left
 * there, scrolling its own overflow; 300px wide from xl, 350px past 1650px.
 * Below xl it is a full-width block as tall as its content.
 */
const Aside: FC<PartProps> = ({ className, children, ...props }) => (
  <div
    data-slot="stepper-layout-aside"
    className={cn(
      'sticky z-95 w-full shrink-0',
      'top-[calc(var(--stepper-sticky-top)+10px)] h-[calc(var(--stepper-sticky-height)-10px)] max-xl:h-auto',
      'xl:flex xl:w-[300px] xl:overflow-auto xl:bottom-0 xl:right-0 min-[1651px]:w-[350px]',
      className,
    )}
    {...props}
  >
    <div className="w-full">{children}</div>
  </div>
);

export const StepperLayout = { Container, Header, Body, Aside };

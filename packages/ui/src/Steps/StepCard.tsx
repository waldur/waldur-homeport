import { FC, PropsWithChildren, ReactNode } from 'react';

import { AccordionCard, AccordionCardProps } from '../AccordionCard';
import { AlertItem } from '../AlertItem';
import { RefreshIconButton } from '../Button';
import { Card, CardContent, CardHeader } from '../Card';
import { cn } from '../cn';

import { StepLoading } from './StepLoading';

export interface StepCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Controls at the right of the header; locked with the step. */
  actions?: ReactNode;
  /** The step's anchor: the card's `id` (for a step nav) and `data-testid`. */
  id?: string;
  /** Shows the step's loading state instead of its content. */
  loading?: boolean;
  className?: string;
  /** Locks the step: its fields and header actions can't be reached. */
  disabled?: boolean;
  /** Why the step is locked; shown as a notice at the top of the step. */
  disabledReason?: string;
  /** Shows a refresh button beside the title. */
  refetch?(): void;
  refetching?: boolean;
}

// React 18 has no typing for `inert` and drops a boolean `true`; the empty
// string sets the attribute. (React 19 takes `inert={true}`.)
const inertProps = (on?: boolean) =>
  on ? ({ inert: '' } as Record<string, string>) : {};

/**
 * Locks its children: `disabled` on the fieldset gives native controls their
 * own disabled styles, `inert` takes everything inside — native or not, such
 * as react-select — out of pointer, focus and keyboard reach. The fieldset
 * (`data-slot="step-fieldset"`, an end-to-end test hook)
 * draws no box of its own.
 */
const LockedRegion: FC<PropsWithChildren<{ locked?: boolean }>> = ({
  locked,
  children,
}) => (
  <fieldset
    className="contents"
    data-slot="step-fieldset"
    disabled={locked}
    {...inertProps(locked)}
  >
    {children}
  </fieldset>
);

export interface StepLockProps {
  disabled?: boolean;
  /** Why the content is locked; shown as a notice above it. */
  disabledReason?: string;
}

/**
 * Content of a step that can be locked (e.g. no organization or project
 * yet), for a step drawn in a card of its own (such as an `AccordionCard`).
 * A locked step states why up front rather than in a hover tooltip, and the
 * reason stays outside the locked region, so it is still read out.
 */
export const StepLock: FC<PropsWithChildren<StepLockProps>> = ({
  disabled,
  disabledReason,
  children,
}) => (
  <>
    {disabled && disabledReason ? (
      <AlertItem
        type="floating"
        title={disabledReason}
        className="mb-5"
        data-slot="step-lock-reason"
      />
    ) : null}
    <LockedRegion locked={disabled}>{children}</LockedRegion>
  </>
);

/**
 * One step of a long, single-page form (an order form, a proposal): a
 * bordered card with the step's title, optional subtitle, refresh button and
 * actions, that a step nav (`StepNav`) scrolls to by `id`. While `disabled`
 * the step is locked (`data-state="locked"`), with `disabledReason` shown
 * above its content.
 *
 * Parts carry `data-slot`: `step-card-title`, `step-card-subtitle`,
 * `step-card-actions`; the card itself is a waldur-ui `Card` (`card`,
 * `card-header`, `card-content`).
 */
export const StepCard: FC<PropsWithChildren<StepCardProps>> = (props) => (
  <Card
    bordered
    className={cn('data-[state=locked]:cursor-not-allowed', props.className)}
    id={props.id}
    data-testid={props.id}
    data-state={props.disabled ? 'locked' : undefined}
  >
    <CardHeader className="gap-1.5">
      <div className="flex items-center me-1.5">
        <div>
          <h4
            className="m-0 text-base leading-[1.2] font-semibold text-primary"
            data-slot="step-card-title"
          >
            {props.title}
          </h4>
          {props.subtitle && (
            <small
              className="text-sm font-normal block mt-1.5"
              data-slot="step-card-subtitle"
            >
              {props.subtitle}
            </small>
          )}
        </div>
        {props.refetch && (
          <LockedRegion locked={props.disabled}>
            <div className="ms-1.5">
              <RefreshIconButton
                loading={props.refetching}
                refetch={props.refetch}
              />
            </div>
          </LockedRegion>
        )}
      </div>
      {props.actions && (
        <LockedRegion locked={props.disabled}>
          <div className="flex ms-auto" data-slot="step-card-actions">
            {props.actions}
          </div>
        </LockedRegion>
      )}
    </CardHeader>
    <CardContent>
      <StepLock disabled={props.disabled} disabledReason={props.disabledReason}>
        {props.loading ? <StepLoading /> : props.children}
      </StepLock>
    </CardContent>
  </Card>
);

export interface StepAccordionCardProps
  extends Omit<AccordionCardProps, 'disabled'>, StepLockProps {}

/**
 * A step drawn as an `AccordionCard`, which the reader may fold away. While
 * `disabled` it is locked like a `StepCard`: it stays open, so its reason
 * and its disabled fields show, it can't be folded, and it is marked
 * `data-state="locked"`. Once unlocked it opens or closes as it would have
 * (`defaultOpen`, or the controlled `isOpen`).
 */
export const StepAccordionCard: FC<StepAccordionCardProps> = ({
  disabled,
  disabledReason,
  isOpen,
  className,
  children,
  ...props
}) => (
  <AccordionCard
    {...props}
    isOpen={disabled ? true : isOpen}
    disabled={disabled}
    className={cn('data-[state=locked]:cursor-not-allowed', className)}
  >
    <StepLock disabled={disabled} disabledReason={disabledReason}>
      {children}
    </StepLock>
  </AccordionCard>
);

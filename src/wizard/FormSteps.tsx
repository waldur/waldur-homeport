import { FC } from 'react';

import { getStepNavItems } from 'waldur-ui';
import { useStepStatuses, UseStepStatusesOptions } from 'waldur-wizard';

import { ScrollSpyNav } from '@/navigation/ScrollSpyNav';

/**
 * The side nav of a long, single-page form (an order form, a proposal):
 * waldur-wizard's step statuses drawn by waldur-ui's step nav items, with
 * the links routed through UI-Router.
 */
export const FormSteps: FC<
  UseStepStatusesOptions & {
    /** Suppress the trailing status icon column. Use for read-only
     *  navigation where completion / error state isn't meaningful (e.g.
     *  viewing a submitted proposal). */
    hideStatusIcons?: boolean;
    /** Called with the step's id when the reader picks it. */
    onSelect?(id: string): void;
  }
> = ({ hideStatusIcons, onSelect, ...options }) => {
  const steps = useStepStatuses(options);
  return (
    <ScrollSpyNav
      items={getStepNavItems(steps, { hideStatusIcons })}
      onSelect={onSelect ? (key) => onSelect(key) : undefined}
    />
  );
};

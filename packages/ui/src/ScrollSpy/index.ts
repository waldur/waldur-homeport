/**
 * ScrollSpy Navigation & Section Tracking Primitive Suite
 *
 * A cohesive set of utilities and components for observing in-page section scrolling
 * and rendering accessible navigation indicators:
 *
 * 1. `useScrollTracker`:
 *    - Reactive hook monitoring element visibility and intersection area.
 *    - Configurable tracking strategies ('area', 'top', 'bottom') and offset margins.
 *    - Window or container scroll targets with throttled event execution.
 *
 * 2. `scrollToSection` / `scrollToSectionById`:
 *    - Smooth programmatic scrolling to target elements or IDs.
 *    - Offsets for sticky topbars/headers and container boundary safety.
 *
 * 3. `ScrollSpyNav`:
 *    - Semantic `<nav>` list featuring accessible ARIA landmarks (`aria-current="true"`).
 *    - Persistent selection lock during click navigation transitions.
 *    - Flexible `renderItem` slot for framework-agnostic routing (UI-Router, Next.js, React Router).
 */

export {
  resolveContainer,
  scrollToSection,
  scrollToSectionById,
} from './scrollToSection';
export type {
  ScrollContainer,
  ScrollToSectionOptions,
} from './scrollToSection';

export { useScrollTracker } from './useScrollTracker';
export type {
  ScrollTrackSide,
  UseScrollTrackerOptions,
} from './useScrollTracker';

export {
  ScrollSpyNav,
  SCROLLSPY_NAV_LINK_ACTIVE,
  SCROLLSPY_NAV_LINK_BASE,
  SCROLLSPY_NAV_LINK_INACTIVE,
} from './ScrollSpyNav';
export type {
  ScrollSpyItem,
  ScrollSpyItemRenderProps,
  ScrollSpyNavProps,
} from './ScrollSpyNav';

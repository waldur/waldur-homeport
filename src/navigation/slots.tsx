import { UIViewContext } from '@uirouter/react';
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

/**
 * The places in Layout's chrome a page can fill:
 * - `hero`: the page hero above the page tabs.
 * - `actions`: controls at the end of the page tabs row.
 * - `filters`: the filter bar under the page tabs.
 * - `announcements`: bars under the header, beside the admin announcements.
 */
export type LayoutSlotName = 'hero' | 'actions' | 'filters' | 'announcements';

const SLOT_NAMES: LayoutSlotName[] = [
  'hero',
  'actions',
  'filters',
  'announcements',
];

/** Slots that show one occupant; the others show every occupant in turn. */
const SINGLE_SLOTS = new Set<LayoutSlotName>(['hero', 'actions', 'filters']);

interface Occupant {
  id: string;
  /** How many UI-Router views deep the occupant renders. */
  depth: number;
}

interface LayoutSlotsValue {
  targets: Partial<Record<LayoutSlotName, HTMLElement>>;
  /** The occupant a single slot shows. */
  shown: Partial<Record<LayoutSlotName, string>>;
  occupy: (name: LayoutSlotName, occupant: Occupant) => void;
  leave: (name: LayoutSlotName, id: string) => void;
}

const LayoutSlotsContext = createContext<LayoutSlotsValue | null>(null);

/**
 * A single slot shows its innermost occupant: a page nested in another
 * page's view (a user's details inside an organization) replaces its
 * parent's hero instead of adding a second one. Between occupants at the
 * same depth the one that came last wins.
 */
export const getShownOccupant = (occupants: Occupant[]) =>
  occupants.reduce<Occupant | undefined>(
    (shown, occupant) =>
      !shown || occupant.depth >= shown.depth ? occupant : shown,
    undefined,
  )?.id;

const getViewDepth = (fqn: string | undefined) =>
  fqn ? fqn.split('.').length : 0;

/**
 * Renders its children into one of Layout's slots, from wherever the page
 * renders it. The children stay part of the page's React tree (its state,
 * hooks and context), only their DOM moves, and they come and go in the
 * same commit as the page. Render it only when there is something to show:
 * a mounted slot counts as filled, and Layout makes room for it.
 *
 * `announcements` shows every occupant. `hero`, `actions` and `filters`
 * show one: the occupant in the innermost UI-Router view.
 * Outside Layout (a story, a unit test without it) it renders nothing.
 */
export const LayoutSlot: FC<PropsWithChildren<{ name: LayoutSlotName }>> = ({
  name,
  children,
}) => {
  const slots = useContext(LayoutSlotsContext);
  const depth = getViewDepth(useContext(UIViewContext)?.fqn);
  const id = useId();
  const occupy = slots?.occupy;
  const leave = slots?.leave;
  useLayoutEffect(() => {
    if (!occupy) return undefined;
    occupy(name, { id, depth });
    return () => leave(name, id);
  }, [name, id, depth, occupy, leave]);
  const target = slots?.targets[name];
  if (!target) return null;
  if (SINGLE_SLOTS.has(name) && slots.shown[name] !== id) return null;
  return createPortal(children, target);
};

/**
 * Layout's side of the slots: the provider value, a callback ref for each
 * slot's element, and whether a slot is filled. A slot's element may render
 * only while the slot is filled; the portals follow it.
 */
export const useLayoutSlots = () => {
  const [targets, setTargets] = useState<LayoutSlotsValue['targets']>({});
  const [occupants, setOccupants] = useState<
    Partial<Record<LayoutSlotName, Occupant[]>>
  >({});

  const occupy = useCallback(
    (name: LayoutSlotName, occupant: Occupant) =>
      setOccupants((prev) => ({
        ...prev,
        [name]: [
          ...(prev[name] ?? []).filter(({ id }) => id !== occupant.id),
          occupant,
        ],
      })),
    [],
  );

  const leave = useCallback(
    (name: LayoutSlotName, id: string) =>
      setOccupants((prev) => ({
        ...prev,
        [name]: (prev[name] ?? []).filter((occupant) => occupant.id !== id),
      })),
    [],
  );

  const slotRef = useMemo(
    () =>
      Object.fromEntries(
        SLOT_NAMES.map((name) => [
          name,
          (element: HTMLElement | null) =>
            setTargets((prev) =>
              prev[name] === (element ?? undefined)
                ? prev
                : { ...prev, [name]: element ?? undefined },
            ),
        ]),
      ) as Record<LayoutSlotName, (element: HTMLElement | null) => void>,
    [],
  );

  const shown = useMemo(
    () =>
      Object.fromEntries(
        SLOT_NAMES.map((name) => [
          name,
          getShownOccupant(occupants[name] ?? []),
        ]),
      ) as LayoutSlotsValue['shown'],
    [occupants],
  );

  const value = useMemo(
    () => ({ targets, shown, occupy, leave }),
    [targets, shown, occupy, leave],
  );

  const filled = useCallback(
    (name: LayoutSlotName) => (occupants[name]?.length ?? 0) > 0,
    [occupants],
  );

  return { value, slotRef, filled };
};

export const LayoutSlotsProvider = LayoutSlotsContext.Provider;

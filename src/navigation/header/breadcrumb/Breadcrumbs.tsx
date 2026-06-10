import { useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Breadcrumb } from 'react-bootstrap';

import { LayoutContext } from '@/navigation/context';
import { IBreadcrumbItem } from '@/navigation/types';

import { BreadcrumbItem } from './BreadcrumbItem';
import { DropdownBreadcrumbItem } from './DropdownBreadcrumbItem';
import { HiddenItemsPopover } from './HiddenItemsPopover';

export const Breadcrumbs = () => {
  const { breadcrumbs } = useContext(LayoutContext);
  const navRef = useRef<HTMLElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  // Width of the full (uncollapsed) list, recorded while expanded. Used as the
  // threshold for expanding back so the collapse doesn't flip-flop at the edge.
  const fullWidthRef = useRef(0);

  // When the trail itself changes (navigation), start expanded and re-measure
  // from scratch — otherwise a now-short breadcrumb could stay collapsed,
  // judged against the previous (longer) trail's stale width.
  const [measuredTrail, setMeasuredTrail] = useState(breadcrumbs);
  if (measuredTrail !== breadcrumbs) {
    setMeasuredTrail(breadcrumbs);
    setCollapsed(false);
  }

  // Content-based collapse. The final item always shrinks / middle-truncates to
  // fit (see _breadcrumb.scss), so the list only genuinely overflows when the
  // *leading* items don't fit. When that happens we fold everything between the
  // first and last item into a single "…" popover, giving the "first / … / last"
  // layout. When there is room, the full trail is shown unchanged.
  useLayoutEffect(() => {
    const list = navRef.current?.querySelector<HTMLElement>('.breadcrumb');
    if (!list || typeof ResizeObserver === 'undefined') return;

    const measure = () => {
      if (!collapsed) {
        fullWidthRef.current = list.scrollWidth;
        if (list.scrollWidth > list.clientWidth + 1) {
          setCollapsed(true);
        }
      } else if (list.clientWidth >= fullWidthRef.current) {
        setCollapsed(false);
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [collapsed, breadcrumbs]);

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(() => {
    // Need at least first + one middle + last to have anything to collapse.
    if (!collapsed || breadcrumbs.length <= 2) {
      return breadcrumbs;
    }
    const middle = breadcrumbs.slice(1, -1);
    return [
      breadcrumbs[0],
      {
        key: 'collapsed-middle',
        text: '...',
        dropdown: <HiddenItemsPopover items={middle} />,
        hideDropdownArrow: true,
      },
      breadcrumbs[breadcrumbs.length - 1],
    ];
  }, [breadcrumbs, collapsed]);

  if (!breadcrumbs.length) {
    return null;
  }
  return (
    <Breadcrumb className="flex-grow-1" ref={navRef}>
      {breadcrumbItems.map((item) =>
        item.dropdown ? (
          <DropdownBreadcrumbItem key={item.key} item={item} />
        ) : (
          <BreadcrumbItem
            key={item.key}
            to={item.to}
            params={item.params}
            onClick={item.onClick}
            ellipsis={item.ellipsis}
            truncate={item.truncate}
            active={item.active}
            maxLength={item.maxLength}
            tooltipText={item.tooltipText}
            isBack={breadcrumbItems.length === 1}
          >
            {item.text}
          </BreadcrumbItem>
        ),
      )}
    </Breadcrumb>
  );
};

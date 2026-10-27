import { CaretDownIcon, CaretLeftIcon } from '@phosphor-icons/react';
import {
  cloneElement,
  ComponentPropsWithoutRef,
  FC,
  forwardRef,
  Fragment,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { translate } from 'waldur-i18n-runtime';

import { cn } from '../cn';
import { MiddleTruncate } from '../MiddleTruncate';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { Tooltip } from '../Tooltip';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './Breadcrumb';
import {
  BreadcrumbLinkRenderer,
  BreadcrumbLinkRendererContext,
  IBreadcrumbItem,
  useBreadcrumbItems,
} from './BreadcrumbsContext';

type CrumbClickHandler = (event: MouseEvent<HTMLElement>) => void;

// Every control lays its label out as a row that may shrink, so the final
// crumb's MiddleTruncate can collapse.
const CONTROL_CLASS = 'inline-flex items-center min-w-0';

const shorten = (text: string, length: number, separator = '...') => {
  if (text.length <= length) return text;
  const shown = length - separator.length;
  return (
    text.slice(0, Math.ceil(shown / 2)) +
    separator +
    text.slice(text.length - Math.floor(shown / 2))
  );
};

const CrumbText: FC<{
  text: string;
  current?: boolean;
  maxLength?: number;
  truncate?: boolean;
  tooltip?: string;
  isLast?: boolean;
}> = ({ text, current, maxLength, truncate, tooltip, isLast }) => {
  if (current) {
    // The current crumb (e.g. resource name) stays on one line and
    // middle-truncates ("start…end") only when it doesn't fit, so the header
    // actions stay on screen and the suffix stays readable.
    return <MiddleTruncate text={text} />;
  }
  if (maxLength) {
    return (
      <span>
        {text.length > maxLength + 5 ? (
          <Tooltip label={text} side="bottom">
            <span>{shorten(text, maxLength)}</span>
          </Tooltip>
        ) : (
          text
        )}
      </span>
    );
  }
  if (truncate || isLast) {
    return (
      <span
        className={cn(
          'inline-block truncate align-middle',
          truncate && 'max-w-[320px]',
        )}
        title={tooltip || text}
      >
        {text}
      </span>
    );
  }
  return <span>{text}</span>;
};

/**
 * A router link given an `onClick` may turn into role="button" (the app's
 * `Link` does; see TabNav), so the trail's handler rides on the capture phase
 * instead and the link stays a link.
 */
const withLabel = (
  link: ReactElement,
  content: ReactNode,
  onClick?: CrumbClickHandler,
) =>
  cloneElement(
    link as ReactElement<Record<string, unknown>>,
    onClick ? { onClickCapture: onClick } : undefined,
    content,
  );

/**
 * Where a crumb's `to` leads: the app's router link from the provider's (or
 * the trail's) renderLink, or a plain href when there is none.
 */
const useCrumbTarget = () => {
  const renderLink = useContext(BreadcrumbLinkRendererContext);
  return ({ to, params }: IBreadcrumbItem) => {
    if (!to) return {};
    return renderLink ? { link: renderLink(to, params) } : { href: to };
  };
};

interface TrailCrumbProps extends Omit<
  ComponentPropsWithoutRef<'li'>,
  'children' | 'onClick'
> {
  current?: boolean;
  isLast?: boolean;
  truncate?: boolean;
  maxLength?: number;
  tooltip?: string;
  isBack?: boolean;
  link?: ReactElement;
  href?: string;
  onClick?: CrumbClickHandler;
  children?: ReactNode;
}

const TrailCrumb = forwardRef<HTMLLIElement, TrailCrumbProps>(
  (
    {
      current = false,
      isLast,
      truncate,
      maxLength,
      tooltip,
      isBack,
      link,
      href,
      onClick,
      children,
      className,
      ...rest
    },
    ref,
  ) => {
    const isText = typeof children === 'string';
    const isLink = Boolean(link || href);

    const content = (
      <>
        {isBack && (
          <>
            <CaretLeftIcon
              weight="bold"
              size={24}
              className="me-1.5 shrink-0 inline-block align-middle"
            />
            {translate('Go back to')}&nbsp;
          </>
        )}
        {isText ? (
          <CrumbText
            text={children}
            current={current}
            isLast={isLast}
            maxLength={maxLength}
            truncate={truncate}
            tooltip={tooltip}
          />
        ) : (
          // Holds a switcher crumb's label or trigger.
          <span className={CONTROL_CLASS}>{children}</span>
        )}
      </>
    );

    let control: ReactNode;
    if (current) {
      // A switcher crumb's children are its PopoverTrigger (role="button"),
      // which must not sit inside BreadcrumbPage.
      control = isText ? (
        <BreadcrumbPage className={CONTROL_CLASS}>{content}</BreadcrumbPage>
      ) : (
        content
      );
    } else if (link) {
      control = (
        <BreadcrumbLink asChild className={CONTROL_CLASS}>
          {withLabel(link, content, onClick)}
        </BreadcrumbLink>
      );
    } else if (href) {
      control = (
        <BreadcrumbLink href={href} onClick={onClick} className={CONTROL_CLASS}>
          {content}
        </BreadcrumbLink>
      );
    } else if (onClick) {
      control = (
        <BreadcrumbLink asChild className={CONTROL_CLASS}>
          <button
            type="button"
            onClick={onClick}
            className="bg-transparent border-0 p-0 m-0 cursor-pointer"
          >
            {content}
          </button>
        </BreadcrumbLink>
      );
    } else {
      control = (
        <span className={cn(CONTROL_CLASS, 'cursor-default select-none')}>
          {content}
        </span>
      );
    }

    return (
      <BreadcrumbItem
        {...rest}
        ref={ref}
        // A text crumb carries aria-current on its BreadcrumbPage; a switcher
        // crumb has none, so the item itself marks the current page.
        aria-current={current && !isText ? 'page' : undefined}
        className={cn(
          // Leading items keep their natural width; only the final one shrinks,
          // so its MiddleTruncate collapses the middle of a long name.
          'shrink-0 last:shrink',
          current || (!isLink && !onClick)
            ? 'text-quaternary cursor-default'
            : 'text-brand',
          className,
        )}
      >
        {control}
      </BreadcrumbItem>
    );
  },
);
TrailCrumb.displayName = 'TrailCrumb';

const MenuCrumb = ({ item }: { item: IBreadcrumbItem }) => {
  const { link, href } = useCrumbTarget()(item);
  const [show, setShow] = useState(false);
  const crumbRef = useRef<HTMLLIElement>(null);
  const interactedOutside = useRef(false);
  const isLink = Boolean(link || href);

  // Toggle on the keys the crumb's own control ignores. Handling one it already
  // activates on would toggle twice and leave the panel shut. The current
  // crumb's label is a span with role="button" (neither key); a linked crumb is
  // an <a> (Enter only); any other crumb, such as the collapsed "...", is a
  // <button> (both keys).
  const nativeKeys = item.active ? [] : isLink ? ['Enter'] : ['Enter', ' '];
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (
      (event.key === ' ' || event.key === 'Enter') &&
      !nativeKeys.includes(event.key)
    ) {
      event.preventDefault();
      setShow((value) => !value);
    }
  };

  const arrow = !item.hideDropdownArrow && (
    <CaretDownIcon
      weight="bold"
      size={16}
      className="shrink-0 ms-1.5 text-secondary"
      aria-hidden="true"
    />
  );

  const crumb = (
    <TrailCrumb
      ref={crumbRef}
      link={link}
      href={href}
      current={item.active}
      className="cursor-pointer"
      onKeyDown={onKeyDown}
    >
      {item.active ? (
        // Nothing in the current crumb is focusable, so the label becomes the
        // trigger: the <li> would drag the separator slash into the focus
        // ring, and Radix hands focus back to the trigger on close, which an
        // <li> cannot take.
        <PopoverTrigger asChild>
          <span
            role="button"
            tabIndex={0}
            className="flex min-w-0 items-center"
          >
            {/* Stays on one line and middle-truncates ("start…end") only when
                it doesn't fit, so the header actions stay on screen. */}
            <MiddleTruncate text={item.text} />
            {arrow}
          </span>
        </PopoverTrigger>
      ) : (
        <>
          {item.truncate && item.text.length > 4 ? (
            <span
              className="inline-block max-w-[320px] truncate align-middle"
              title={item.text}
            >
              {item.text}
            </span>
          ) : (
            item.text
          )}
          {arrow}
        </>
      )}
    </TrailCrumb>
  );

  // The panel is portaled to the end of <body>, so Tab off either end of it
  // would land far from the crumb -- in the browser chrome, or at the top of the
  // page. Close it there instead; returnFocus then puts focus back on the crumb.
  // Shift+Tab from the panel itself counts as leaving: the "..." panel opens
  // with focus on its container rather than on a link.
  const leaveOnTab = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]',
      ),
    ).filter(
      // Not the tabindex=-1 ones: a search dropdown's rows are options of a
      // listbox, reached by the arrow keys from its search box, not by Tab.
      (node) =>
        node.tabIndex !== -1 &&
        (typeof node.checkVisibility === 'function'
          ? node.checkVisibility()
          : node.offsetParent !== null),
    );
    const edge = event.shiftKey
      ? focusable[0]
      : focusable[focusable.length - 1];
    const leaving =
      !edge ||
      document.activeElement === edge ||
      (event.shiftKey && document.activeElement === event.currentTarget);
    if (!leaving) return;
    event.preventDefault();
    setShow(false);
  };

  // Radix focuses the trigger on close, but for every crumb except the current
  // one the trigger is the <li>, which cannot take focus, so it fell to <body>.
  // Focus the crumb's own control instead -- unless the panel closed because
  // the user clicked or tabbed elsewhere, where Radix leaves focus alone too.
  const returnFocus = (event: Event) => {
    event.preventDefault();
    if (!interactedOutside.current) {
      crumbRef.current
        ?.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex="0"]',
        )
        ?.focus();
    }
    interactedOutside.current = false;
  };

  return (
    // Non-modal, so the page stays clickable while a switcher is open: a modal
    // one turned the first click on a sidebar link into a mere close.
    <Popover open={show} onOpenChange={setShow} modal={false}>
      {item.active ? crumb : <PopoverTrigger asChild>{crumb}</PopoverTrigger>}
      <PopoverContent
        onKeyDown={leaveOnTab}
        onInteractOutside={() => {
          interactedOutside.current = true;
        }}
        onCloseAutoFocus={returnFocus}
        side="bottom"
        align="start"
        sideOffset={2}
        className="z-header-popover max-w-[400px] min-w-[200px] pb-1.5"
      >
        {typeof item.dropdown === 'function'
          ? item.dropdown(() => setShow(false))
          : item.dropdown}
      </PopoverContent>
    </Popover>
  );
};

const PlainCrumb = ({
  item,
  isBack,
  isLast,
}: {
  item: IBreadcrumbItem;
  isBack: boolean;
  isLast: boolean;
}) => {
  const { link, href } = useCrumbTarget()(item);
  return (
    <TrailCrumb
      link={link}
      href={href}
      onClick={item.onClick}
      truncate={item.truncate}
      current={item.active}
      isLast={isLast}
      maxLength={item.maxLength}
      tooltip={item.tooltipText}
      isBack={isBack}
    >
      {item.text}
    </TrailCrumb>
  );
};

const HIDDEN_ROW_CLASS = 'block py-1.5 px-4 text-sm';
const HIDDEN_LINK_CLASS = cn(
  HIDDEN_ROW_CLASS,
  'text-brand hover:bg-[var(--bg-brand-primary-alt)]',
);

/** The crumbs folded into the "..." of a collapsed trail. */
export const BreadcrumbHiddenItems: FC<{ items: IBreadcrumbItem[] }> = ({
  items,
}) => {
  const target = useCrumbTarget();
  return (
    <div className="max-h-[300px] overflow-auto">
      <ul className="list-none m-0 p-0">
        {items.map((item) => {
          const { link, href } = target(item);
          return (
            <li key={item.key}>
              {link ? (
                cloneElement(
                  link as ReactElement<Record<string, unknown>>,
                  {
                    className: HIDDEN_LINK_CLASS,
                    onClickCapture: item.onClick,
                  },
                  // In a span: the app's Link styles a bare string label as
                  // Metronic's .text-anchor.
                  <span>{item.text}</span>,
                )
              ) : href ? (
                <a
                  href={href}
                  className={HIDDEN_LINK_CLASS}
                  onClick={item.onClick}
                >
                  {item.text}
                </a>
              ) : item.onClick ? (
                <button
                  type="button"
                  className={cn(
                    HIDDEN_LINK_CLASS,
                    'w-full text-start bg-transparent border-0',
                  )}
                  onClick={item.onClick}
                >
                  {item.text}
                </button>
              ) : (
                // Non-navigable crumb (e.g. an organization the user can't
                // open): plain text rather than a link to nowhere.
                <span className={cn(HIDDEN_ROW_CLASS, 'text-quaternary')}>
                  {item.text}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

interface BreadcrumbTrailProps {
  /** Defaults to the crumbs pages set with useBreadcrumbs. */
  items?: IBreadcrumbItem[];
  /** Overrides the BreadcrumbsProvider's renderLink for this trail. */
  renderLink?: BreadcrumbLinkRenderer;
  className?: string;
}

/**
 * A single-line breadcrumb trail that fits its container: the final crumb
 * middle-truncates, and when the leading crumbs don't fit either, everything
 * between the first and last folds into a "..." popover. A lone crumb reads
 * "Go back to …". Router-agnostic: a crumb's `to` becomes a link through
 * `renderLink` (see BreadcrumbsProvider), or a plain href without one.
 */
export const BreadcrumbTrail: FC<BreadcrumbTrailProps> = ({
  items,
  renderLink,
  className,
}) => {
  const pageItems = useBreadcrumbItems();
  const inheritedRenderLink = useContext(BreadcrumbLinkRendererContext);
  return (
    <BreadcrumbLinkRendererContext.Provider
      value={renderLink ?? inheritedRenderLink}
    >
      <Trail items={items ?? pageItems} className={className} />
    </BreadcrumbLinkRendererContext.Provider>
  );
};

const areItemsEqual = (a: IBreadcrumbItem[], b: IBreadcrumbItem[]): boolean => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const itemA = a[i];
    const itemB = b[i];
    if (
      itemA.key !== itemB.key ||
      itemA.text !== itemB.text ||
      itemA.active !== itemB.active ||
      itemA.to !== itemB.to ||
      itemA.dropdown !== itemB.dropdown ||
      itemA.onClick !== itemB.onClick ||
      itemA.truncate !== itemB.truncate ||
      itemA.maxLength !== itemB.maxLength ||
      itemA.hideDropdownArrow !== itemB.hideDropdownArrow
    ) {
      return false;
    }
  }
  return true;
};

const Trail: FC<{ items: IBreadcrumbItem[]; className?: string }> = ({
  items,
  className,
}) => {
  const listRef = useRef<HTMLOListElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  // Width of the full (uncollapsed) list, recorded while expanded. Used as the
  // threshold for expanding back so the collapse doesn't flip-flop at the edge.
  const fullWidthRef = useRef(0);

  // When the trail itself changes (navigation), start expanded and re-measure
  // from scratch — otherwise a now-short trail could stay collapsed, judged
  // against the previous (longer) trail's stale width.
  const [measuredItems, setMeasuredItems] = useState(items);
  if (!areItemsEqual(measuredItems, items)) {
    setMeasuredItems(items);
    setCollapsed(false);
  }

  // Content-based collapse. The final item always shrinks / middle-truncates to
  // fit, so the list only genuinely overflows when the *leading* items don't
  // fit. Then everything between the first and last item folds into a single
  // "..." popover, giving the "first / … / last" layout.
  useLayoutEffect(() => {
    const list = listRef.current;
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
  }, [collapsed, measuredItems]);

  const shown = useMemo<IBreadcrumbItem[]>(() => {
    // Need at least first + one middle + last to have anything to collapse.
    if (!collapsed || items.length <= 2) {
      return items;
    }
    return [
      items[0],
      {
        key: 'collapsed-middle',
        text: '...',
        dropdown: <BreadcrumbHiddenItems items={items.slice(1, -1)} />,
        hideDropdownArrow: true,
      },
      items[items.length - 1],
    ];
  }, [items, collapsed]);

  if (!items.length) {
    return null;
  }
  return (
    <Breadcrumb className={cn('grow overflow-hidden', className)}>
      {/* nowrap + overflow-hidden: scrollWidth then reports the full trail's
          width for the collapse measurement above. The separators carry their
          own spacing, so the list's gap is dropped. */}
      <BreadcrumbList
        ref={listRef}
        className="flex-nowrap grow min-w-0 overflow-hidden gap-0"
      >
        {shown.map((item, index) => (
          <Fragment key={item.key}>
            {index > 0 && <BreadcrumbSeparator className="mx-[6px]" />}
            {item.dropdown ? (
              <MenuCrumb item={item} />
            ) : (
              <PlainCrumb
                item={item}
                isLast={index === shown.length - 1}
                isBack={
                  shown.length === 1 &&
                  !item.active &&
                  Boolean(item.to || item.onClick)
                }
              />
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

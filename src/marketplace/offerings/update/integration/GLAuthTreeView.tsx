import {
  CaretDownIcon,
  CaretRightIcon,
  FolderIcon,
  InfoIcon,
  TagIcon,
  UserIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react';
import {
  ChangeEvent,
  createContext,
  CSSProperties,
  FC,
  forwardRef,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  memo,
  useContext,
  useDeferredValue,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FixedSizeList } from 'react-window';
import type {
  GlauthGroupKind,
  GlauthTree,
  GlauthTreeGroup,
  GlauthTreeRobotAccount,
  GlauthTreeUser,
} from 'waldur-js-client';

import { Badge, type BadgeTone, type BadgeVariant } from 'waldur-ui';

import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';

export type { GlauthTree };

// Placeholder for glauth's actual baseDN. Glauth has a single operator-set
// baseDN per instance (e.g. `dc=glauth,dc=com`) — it is NOT segmented by
// offering. We can't know it from mastermind, so we show a clear
// placeholder rather than fabricate one from the offering slug.
const BASE_DN = 'dc=⟨base⟩';

type NodeType =
  'root' | 'ou' | 'group' | 'user' | 'svcacct' | 'attr' | 'waldur_attr';

interface TreeNodeData {
  id: string;
  name: string;
  type: NodeType;
  badge?: { text: string; variant: BadgeVariant; tone?: BadgeTone };
  children?: TreeNodeData[];
  /** Name and badge, lower-cased once for searching. */
  searchText?: string;
}

const kindBadge = (
  kind: GlauthGroupKind,
): { text: string; variant: BadgeVariant; tone: BadgeTone } => {
  switch (kind) {
    case 'project':
      return { text: 'project', variant: 'secondary', tone: 'outline' };
    case 'resource_role':
      return { text: 'resource role', variant: 'primary', tone: 'outline' };
    case 'resource_project_role':
      return { text: 'rp role', variant: 'success', tone: 'outline' };
    case 'personal':
      return { text: 'personal', variant: 'neutral', tone: 'outline' };
  }
};

const groupAttributes = (g: GlauthTreeGroup): TreeNodeData[] => {
  // Real LDAP attributes that glauth actually returns for a posixGroup.
  const real: [string, string][] = [
    ['objectClass', 'posixGroup'],
    ['cn', g.name],
    ['gidNumber', String(g.gid)],
  ];
  if (g.members.length === 0) {
    real.push(['memberUid', '(none)']);
  } else {
    for (const m of g.members) real.push(['memberUid', m]);
  }
  const ldap = real.map(([k, v], i) => ({
    id: `${g.gid}:attr:${i}`,
    name: `${k}: ${v}`,
    type: 'attr' as NodeType,
  }));

  // Waldur context — useful for debugging but NOT part of glauth's LDAP
  // response. Surface them separately so operators don't think
  // `ldapsearch` would return them.
  const context: [string, string][] = [];
  if (g.role) context.push(['role', g.role]);
  context.push(['scope', `${g.scope.type} / ${g.scope.name || g.scope.uuid}`]);
  const waldur = context.map(([k, v], i) => ({
    id: `${g.gid}:waldur:${i}`,
    name: `${k}: ${v}`,
    type: 'waldur_attr' as NodeType,
  }));

  return [...ldap, ...waldur];
};

const userAttributes = (u: GlauthTreeUser): TreeNodeData[] => {
  const fullName = `${u.givenname ?? ''} ${u.sn ?? ''}`.trim();
  const real: [string, string][] = [
    ['objectClass', 'posixAccount, inetOrgPerson'],
    ['uid', u.username],
    ['cn', fullName || u.username],
  ];
  if (u.givenname) real.push(['givenName', u.givenname]);
  if (u.sn) real.push(['sn', u.sn]);
  if (u.mail) real.push(['mail', u.mail]);
  real.push(
    ['uidNumber', String(u.uidnumber)],
    ['gidNumber', String(u.personal_group)],
    ['homeDirectory', u.home_dir ?? ''],
    ['loginShell', u.login_shell ?? ''],
  );
  // memberOf in real LDAP is a DN — match that shape with the canonical
  // cn=…,ou=groups,⟨base⟩ form rather than mashing role info into the
  // value. Role / gid context goes into the Waldur block below.
  if (u.memberships.length === 0) {
    real.push(['memberOf', '(none)']);
  } else {
    for (const m of u.memberships) {
      real.push(['memberOf', `cn=${m.group_name},ou=groups,${BASE_DN}`]);
    }
  }
  for (const k of u.ssh_keys) real.push(['sshPublicKey', k]);
  const ldap = real.map(([k, v], i) => ({
    id: `u:${u.username}:attr:${i}`,
    name: `${k}: ${v}`,
    type: 'attr' as NodeType,
  }));

  const context: [string, string][] = u.memberships.map((m) => [
    'memberOf',
    `${m.group_name} → gid ${m.gid}${m.role ? `, role ${m.role}` : ''}`,
  ]);
  const waldur = context.map(([k, v], i) => ({
    id: `u:${u.username}:waldur:${i}`,
    name: `${k}: ${v}`,
    type: 'waldur_attr' as NodeType,
  }));

  return [...ldap, ...waldur];
};

const svcAcctAttributes = (r: GlauthTreeRobotAccount): TreeNodeData[] => {
  const real: [string, string][] = [
    ['objectClass', 'posixAccount'],
    ['uid', r.username],
    ['cn', r.username],
    ['uidNumber', String(r.uidnumber)],
    ['gidNumber', String(r.personal_group)],
    ['homeDirectory', r.home_dir ?? ''],
    ['loginShell', r.login_shell ?? ''],
  ];
  for (const k of r.ssh_keys) real.push(['sshPublicKey', k]);
  return real.map(([k, v], i) => ({
    id: `r:${r.username}:attr:${i}`,
    name: `${k}: ${v}`,
    type: 'attr',
  }));
};

const buildNodes = (tree: GlauthTree): TreeNodeData[] => {
  const groupChildren: TreeNodeData[] = tree.groups.map((g) => ({
    id: `group:${g.gid}`,
    // Default glauth `nameformat` is `cn` — so groups appear as cn=… DNs.
    name: `cn=${g.name},ou=groups,${BASE_DN}`,
    type: 'group',
    badge: kindBadge(g.kind),
    children: groupAttributes(g),
  }));

  const userChildren: TreeNodeData[] = tree.users.map((u) => ({
    id: `user:${u.username}`,
    // Default `nameformat` is `cn` per glauth's sample config. The
    // `uid=` variant is opt-in via plugin_options on the glauth side
    // (not exposed by mastermind today).
    name: `cn=${u.username},ou=users,${BASE_DN}`,
    type: 'user',
    badge: u.disabled
      ? { text: translate('disabled'), variant: 'danger', tone: 'outline' }
      : { text: translate('active'), variant: 'success', tone: 'outline' },
    children: userAttributes(u),
  }));

  // Glauth's service-account OU is `svcaccts` (TOML field is
  // `[[users]]` too — they share the user objectClass).
  const svcacctChildren: TreeNodeData[] = tree.robot_accounts.map((r) => ({
    id: `svcacct:${r.username}`,
    name: `cn=${r.username},ou=svcaccts,${BASE_DN}`,
    type: 'svcacct',
    badge: {
      text: translate('service account'),
      variant: 'info',
      tone: 'outline',
    },
    children: svcAcctAttributes(r),
  }));

  const ous: TreeNodeData[] = [
    {
      id: 'ou:groups',
      name: `ou=groups,${BASE_DN}`,
      type: 'ou',
      badge: {
        text: translate('{n} entries', { n: tree.groups.length }),
        variant: 'secondary',
        tone: 'outline',
      },
      children: groupChildren,
    },
    {
      id: 'ou:users',
      name: `ou=users,${BASE_DN}`,
      type: 'ou',
      badge: {
        text: translate('{n} entries', { n: tree.users.length }),
        variant: 'secondary',
        tone: 'outline',
      },
      children: userChildren,
    },
  ];
  if (tree.robot_accounts.length > 0) {
    ous.push({
      id: 'ou:svcaccts',
      name: `ou=svcaccts,${BASE_DN}`,
      type: 'ou',
      badge: {
        text: translate('{n} entries', { n: tree.robot_accounts.length }),
        variant: 'secondary',
        tone: 'outline',
      },
      children: svcacctChildren,
    });
  }

  return [
    {
      id: 'root',
      name: BASE_DN,
      type: 'root',
      badge: {
        text: translate('offering: {name}', { name: tree.offering.name }),
        variant: 'secondary',
        tone: 'outline',
      },
      children: ous,
    },
  ];
};

const withSearchText = (nodes: TreeNodeData[]): TreeNodeData[] =>
  nodes.map((node) => ({
    ...node,
    // A line break keeps a query from matching across name and badge.
    searchText: `${node.name}\n${node.badge?.text ?? ''}`.toLowerCase(),
    children: node.children && withSearchText(node.children),
  }));

const buildTree = (tree: GlauthTree) => withSearchText(buildNodes(tree));

const iconFor = (type: NodeType) => {
  switch (type) {
    case 'root':
    case 'ou':
      return <FolderIcon weight="duotone" size={16} />;
    case 'group':
      return <UsersThreeIcon weight="duotone" size={16} />;
    case 'user':
    case 'svcacct':
      return <UserIcon weight="duotone" size={16} />;
    case 'attr':
      return <TagIcon weight="duotone" size={12} />;
    case 'waldur_attr':
      return <InfoIcon weight="duotone" size={12} />;
  }
};

const INDENT_PX = 22;
const ROW_HEIGHT = 28;
const VIEWPORT_HEIGHT = 500;

/** One visible line of the tree, in display order. */
interface TreeRow {
  node: TreeNodeData;
  /** This row's place in the flattened list, and its parent's. */
  index: number;
  parentIndex?: number;
  level: number;
  hasChildren: boolean;
  isOpen: boolean;
  /** Position among the siblings shown at this level, from 1. */
  position: number;
  siblings: number;
}

interface NodeRowProps {
  id: string;
  row: TreeRow;
  style: CSSProperties;
  isActive: boolean;
  showFocus: boolean;
}

// Rows take no focus and handle no events: the tree container is the one
// Tab stop and points at the active row with aria-activedescendant, so a
// row that scrolls out of the virtualised list never takes focus with it.
const NodeRow: FC<NodeRowProps> = ({ id, row, style, isActive, showFocus }) => {
  const data = row.node;
  const isAttr = data.type === 'attr';
  const isWaldur = data.type === 'waldur_attr';
  const guides = Array.from({ length: row.level });
  return (
    <div
      id={id}
      style={style}
      className={`flex items-stretch ${isActive ? 'bg-brand-subtle' : ''} ${
        isActive && showFocus
          ? 'outline outline-2 -outline-offset-2 outline-brand'
          : ''
      }`}
      role="treeitem"
      aria-level={row.level + 1}
      aria-setsize={row.siblings}
      aria-posinset={row.position}
      aria-expanded={row.hasChildren ? row.isOpen : undefined}
      aria-selected={isActive}
      data-node-id={data.id}
    >
      {guides.map((_, i) => (
        // Metronic's $border-dashed-color ($gray-300). Arbitrary values, as
        // Metronic's own .border-gray-300 is !important and theme-inverted.
        <span
          key={i}
          aria-hidden="true"
          className="shrink-0 border-[color:var(--color-gray-300)] dark:border-[color:var(--color-gray-dark-600)]"
          style={{
            width: INDENT_PX,
            borderLeftWidth: 1,
            borderLeftStyle: 'dashed',
            marginLeft: i === 0 ? 4 : 0,
          }}
        />
      ))}
      <div className="flex items-center px-2 py-1 grow min-w-0">
        <span
          className="me-1 text-quaternary inline-flex"
          style={{ width: 14 }}
        >
          {row.hasChildren ? (
            row.isOpen ? (
              <CaretDownIcon weight="bold" size={12} />
            ) : (
              <CaretRightIcon weight="bold" size={12} />
            )
          ) : null}
        </span>
        <span
          className={`me-2 inline-flex ${
            isWaldur ? 'text-info' : 'text-tertiary'
          }`}
        >
          {iconFor(data.type)}
        </span>
        <span
          className={
            isAttr || isWaldur
              ? `small truncate font-monospace ${
                  isWaldur ? 'fst-italic text-info' : 'text-secondary'
                }`
              : 'text-brand truncate font-monospace'
          }
          title={
            isWaldur
              ? `${data.name} (Waldur context — not returned by glauth)`
              : data.name
          }
        >
          {isAttr || isWaldur
            ? renderAttribute(data.name, isWaldur)
            : data.name}
        </span>
        {data.badge && (
          <Badge
            variant={data.badge.variant}
            tone={data.badge.tone}
            className="ms-2 shrink-0"
          >
            {data.badge.text}
          </Badge>
        )}
      </div>
    </div>
  );
};

const renderAttribute = (line: string, isWaldur: boolean) => {
  const i = line.indexOf(':');
  if (i < 0) return line;
  const name = line.slice(0, i);
  const value = line.slice(i + 1).trimStart();
  return (
    <>
      <span className={isWaldur ? 'text-info' : 'text-quaternary'}>
        {isWaldur ? '※ ' : ''}
        {name}:
      </span>{' '}
      <span className={isWaldur ? 'text-info' : 'text-brand'}>{value}</span>
    </>
  );
};

const EMPTY: Set<string> = new Set();
/** Rows a PageUp or PageDown moves by: what the viewport shows. */
const PAGE = Math.floor(VIEWPORT_HEIGHT / ROW_HEIGHT);

/** `query` is already trimmed and lower-cased. */
const matchesQuery = (node: TreeNodeData, query: string) =>
  node.searchText.includes(query);

/** Ids of the nodes a search shows: those that match, and their ancestors. */
const searchVisible = (nodes: TreeNodeData[], query: string) => {
  const visible = new Set<string>();
  const walk = (node: TreeNodeData): boolean => {
    let shown = matchesQuery(node, query);
    for (const child of node.children ?? []) {
      // Every child is walked: a match deeper down shows this node too.
      shown = walk(child) || shown;
    }
    if (shown) visible.add(node.id);
    return shown;
  };
  nodes.forEach(walk);
  return visible;
};

/**
 * The rows on screen. Without a search every node starts open and `toggled`
 * holds the closed ones. During a search the ancestors of a match start
 * open and show only the branches that lead to matches; a match whose own
 * children do not match starts closed, and opening it shows all of them.
 * There `toggled` holds the nodes flipped from that default.
 */
const flatten = (
  nodes: TreeNodeData[],
  toggled: Set<string>,
  visible: Set<string> | null,
): TreeRow[] => {
  const rows: TreeRow[] = [];
  const walk = (
    siblings: TreeNodeData[],
    level: number,
    filtered: boolean,
    parentIndex?: number,
  ) => {
    siblings.forEach((node, position) => {
      const children = node.children ?? [];
      const hasChildren = children.length > 0;
      const shownChildren =
        filtered && visible
          ? children.filter((child) => visible.has(child.id))
          : children;
      // An ancestor of a match keeps to the matching branches; any other
      // node, once opened, shows everything under it.
      const leadsToMatch = Boolean(
        filtered && visible && shownChildren.length > 0,
      );
      const openByDefault = visible ? leadsToMatch : true;
      const isOpen = hasChildren && openByDefault !== toggled.has(node.id);
      const index = rows.length;
      rows.push({
        node,
        index,
        parentIndex,
        level,
        hasChildren,
        isOpen,
        position: position + 1,
        siblings: siblings.length,
      });
      if (isOpen) {
        walk(
          leadsToMatch ? shownChildren : children,
          level + 1,
          leadsToMatch,
          index,
        );
      }
    });
  };
  walk(visible ? nodes.filter((node) => visible.has(node.id)) : nodes, 0, true);
  return rows;
};

interface RowData {
  baseId: string;
  rows: TreeRow[];
  activeIndex?: number;
  showFocus: boolean;
}

// Outside the tree component, so react-window keeps its rows mounted
// between renders instead of seeing a new component type each time.
const VirtualRow = memo(
  ({
    index,
    style,
    data,
  }: {
    index: number;
    style: CSSProperties;
    data: RowData;
  }) => (
    <NodeRow
      id={`${data.baseId}-${index}`}
      row={data.rows[index]}
      style={style}
      isActive={index === data.activeIndex}
      showFocus={data.showFocus}
    />
  ),
);

const rowKey = (index: number, data: RowData) => data.rows[index].node.id;

// The tree's own attributes and handlers, for the element that scrolls.
const TreeProps = createContext<HTMLAttributes<HTMLDivElement>>({});

// react-window's scrolling element is the tree itself: the one element that
// takes focus. A scroller with nothing focusable inside is a Tab stop of its
// own in current browsers, so a separate tree element around it would leave
// a second, silent stop; and a click on a row focuses this element directly.
const TreeViewport = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { className: treeClassName, ...treeProps } = useContext(TreeProps);
    return (
      <div
        ref={ref}
        {...props}
        {...treeProps}
        className={`${className ?? ''} ${treeClassName ?? ''}`}
        data-testid="ldap-tree-viewport"
      />
    );
  },
);

/**
 * A read-only, virtualised tree: every node starts open, a search shows the
 * matches with their ancestors opened, and the keyboard follows the WAI-ARIA
 * tree pattern (arrows, Page Up/Down, Home/End, Enter/Space).
 */
export const GLAuthTreeView: FC<{ tree: GlauthTree }> = ({ tree }) => {
  const data = useMemo(() => buildTree(tree), [tree]);
  const [search, setSearch] = useState('');
  // Typing stays responsive while a large directory is filtered.
  const query = useDeferredValue(search).trim().toLowerCase();
  // Each mode keeps its own flipped nodes, and a search's start empty for
  // each term, so clearing it brings back whatever was open before.
  const [closed, setClosed] = useState<Set<string>>(() => new Set());
  const [searchToggled, setSearchToggled] = useState({
    query: '',
    ids: new Set<string>(),
  });
  const [activeId, setActiveId] = useState<string>();
  // Focus that came from the keyboard, which is when the ring shows.
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [rendered, setRendered] = useState({ start: 0, stop: -1 });
  const pointerDown = useRef(false);
  const listRef = useRef<FixedSizeList<RowData>>(null);
  const baseId = useId();

  const visible = useMemo(
    () => (query ? searchVisible(data, query) : null),
    [data, query],
  );
  const toggled = query
    ? searchToggled.query === query
      ? searchToggled.ids
      : EMPTY
    : closed;
  const rows = useMemo(
    () => flatten(data, toggled, visible),
    [data, toggled, visible],
  );

  // The row the keyboard acts on: the one last clicked or moved to, or the
  // first row once the keyboard brings focus in. Nothing is highlighted
  // before either.
  const chosen = rows.find((row) => row.node.id === activeId);
  const activeRow = chosen ?? (keyboardFocus ? rows[0] : undefined);
  const activeIndex = activeRow?.index ?? 0;
  const activeShown =
    activeRow !== undefined &&
    activeIndex >= rendered.start &&
    activeIndex <= rendered.stop;

  const toggle = (row: TreeRow) => {
    if (!row.hasChildren) return;
    const flip = (ids: Set<string>) => {
      const next = new Set(ids);
      if (next.has(row.node.id)) next.delete(row.node.id);
      else next.add(row.node.id);
      return next;
    };
    if (query) {
      setSearchToggled((prev) => ({
        query,
        ids: flip(prev.query === query ? prev.ids : EMPTY),
      }));
    } else {
      setClosed(flip);
    }
  };

  const activate = (index: number) => {
    const row = rows[Math.max(0, Math.min(index, rows.length - 1))];
    if (!row) return;
    setActiveId(row.node.id);
    listRef.current?.scrollToItem(row.index);
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    // Leave browser and screen-reader shortcuts alone.
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const row = rows[activeIndex];
    if (!row) return;
    const index = row.index;
    switch (e.key) {
      case 'ArrowDown':
        activate(index + 1);
        break;
      case 'ArrowUp':
        activate(index - 1);
        break;
      case 'PageDown':
        activate(index + PAGE);
        break;
      case 'PageUp':
        activate(index - PAGE);
        break;
      case 'Home':
        activate(0);
        break;
      case 'End':
        activate(rows.length - 1);
        break;
      case 'ArrowRight':
        if (row.hasChildren && !row.isOpen) {
          activate(index);
          toggle(row);
        } else if (rows[index + 1]?.parentIndex === index) {
          activate(index + 1);
        } else {
          activate(index);
        }
        break;
      case 'ArrowLeft':
        if (row.isOpen) {
          activate(index);
          toggle(row);
        } else {
          activate(row.parentIndex ?? index);
        }
        break;
      case 'Enter':
      case ' ':
        // Act on the active row where it can be seen, even after the list
        // was scrolled away from it with the mouse.
        activate(index);
        toggle(row);
        break;
      default:
        return;
    }
    e.preventDefault();
    setKeyboardFocus(true);
  };

  // One handler for every row: the rows themselves stay plain.
  const handleClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      '[data-node-id]',
    );
    const row = rows.find((r) => r.node.id === target?.dataset.nodeId);
    if (!row) return;
    setActiveId(row.node.id);
    toggle(row);
  };

  const itemData = useMemo<RowData>(
    () => ({
      baseId,
      rows,
      activeIndex: activeRow?.index,
      showFocus: keyboardFocus,
    }),
    [baseId, rows, activeRow, keyboardFocus],
  );

  // It points at the active row, so it stays one Tab stop even after its
  // rows scroll out of the list, and shows its own ring only while the
  // active row is out of view.
  const treeProps: HTMLAttributes<HTMLDivElement> = {
    className: `outline-none ${
      keyboardFocus && !activeShown
        ? 'outline outline-2 -outline-offset-2 outline-brand'
        : ''
    }`,
    role: 'tree',
    'aria-label': translate('GLAuth directory'),
    'aria-activedescendant': activeShown
      ? `${baseId}-${activeIndex}`
      : undefined,
    tabIndex: 0,
    onKeyDown: handleKeyDown,
    onClick: handleClick,
    onMouseDown: () => {
      pointerDown.current = true;
      setKeyboardFocus(false);
    },
    onFocus: () => {
      // A click picks its own row; only keyboard focus brings the active
      // row (or the first) into view and shows the ring.
      if (pointerDown.current) {
        pointerDown.current = false;
        return;
      }
      setKeyboardFocus(true);
      listRef.current?.scrollToItem(chosen?.index ?? 0);
    },
    onBlur: () => {
      pointerDown.current = false;
      setKeyboardFocus(false);
    },
  };

  return (
    <div>
      <div className="mb-2 small text-quaternary">
        {translate(
          'Waldur projection of GLAuth entries. The actual base DN ({base}) and DN format ({nameformat}) are configured on the GLAuth server. Italic rows marked ※ are Waldur context — useful for debugging, but NOT returned by an ldapsearch.',
          { base: BASE_DN, nameformat: 'nameformat' },
        )}
      </div>
      <FilterBox
        className="mb-3"
        placeholder={translate(
          'Filter by DN, attribute, role or badge (e.g. memberUid, admin, 60000)…',
        )}
        value={search}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setSearch(e.target.value)
        }
      />
      <div className="border rounded bg-primary">
        <TreeProps.Provider value={treeProps}>
          <FixedSizeList<RowData>
            ref={listRef}
            height={VIEWPORT_HEIGHT}
            width="100%"
            itemCount={rows.length}
            itemSize={ROW_HEIGHT}
            itemData={itemData}
            itemKey={rowKey}
            outerElementType={TreeViewport}
            onItemsRendered={({ visibleStartIndex, visibleStopIndex }) =>
              setRendered({ start: visibleStartIndex, stop: visibleStopIndex })
            }
          >
            {VirtualRow}
          </FixedSizeList>
        </TreeProps.Provider>
      </div>
    </div>
  );
};

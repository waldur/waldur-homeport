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
  FC,
  KeyboardEvent as ReactKeyboardEvent,
  useMemo,
  useState,
} from 'react';
import { NodeApi, NodeRendererProps, Tree } from 'react-arborist';
import type {
  GlauthGroupKind,
  GlauthTree,
  GlauthTreeGroup,
  GlauthTreeRobotAccount,
  GlauthTreeUser,
} from 'waldur-js-client';

import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';

export type { GlauthTree };

// Placeholder for glauth's actual baseDN. Glauth has a single operator-set
// baseDN per instance (e.g. `dc=glauth,dc=com`) — it is NOT segmented by
// offering. We can't know it from mastermind, so we show a clear
// placeholder rather than fabricate one from the offering slug.
const BASE_DN = 'dc=⟨base⟩';

type NodeType =
  | 'root'
  | 'ou'
  | 'group'
  | 'user'
  | 'svcacct'
  | 'attr'
  | 'waldur_attr';

interface TreeNodeData {
  id: string;
  name: string;
  type: NodeType;
  badge?: { text: string; cls: string };
  children?: TreeNodeData[];
}

const kindBadge = (kind: GlauthGroupKind): { text: string; cls: string } => {
  switch (kind) {
    case 'project':
      return { text: 'project', cls: 'bg-secondary text-white' };
    case 'resource_role':
      return { text: 'resource role', cls: 'bg-primary text-white' };
    case 'resource_project_role':
      return { text: 'rp role', cls: 'bg-success text-white' };
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

const buildTree = (tree: GlauthTree): TreeNodeData[] => {
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
      ? { text: translate('disabled'), cls: 'bg-danger text-white' }
      : { text: translate('active'), cls: 'bg-success text-white' },
    children: userAttributes(u),
  }));

  // Glauth's service-account OU is `svcaccts` (TOML field is
  // `[[users]]` too — they share the user objectClass).
  const svcacctChildren: TreeNodeData[] = tree.robot_accounts.map((r) => ({
    id: `svcacct:${r.username}`,
    name: `cn=${r.username},ou=svcaccts,${BASE_DN}`,
    type: 'svcacct',
    badge: { text: translate('service account'), cls: 'bg-info text-white' },
    children: svcAcctAttributes(r),
  }));

  const ous: TreeNodeData[] = [
    {
      id: 'ou:groups',
      name: `ou=groups,${BASE_DN}`,
      type: 'ou',
      badge: {
        text: translate('{n} entries', { n: tree.groups.length }),
        cls: 'bg-secondary text-white',
      },
      children: groupChildren,
    },
    {
      id: 'ou:users',
      name: `ou=users,${BASE_DN}`,
      type: 'ou',
      badge: {
        text: translate('{n} entries', { n: tree.users.length }),
        cls: 'bg-secondary text-white',
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
        cls: 'bg-secondary text-white',
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
        cls: 'bg-secondary text-white',
      },
      children: ous,
    },
  ];
};

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

const NodeRow: FC<NodeRendererProps<TreeNodeData>> = ({
  node,
  style,
  dragHandle,
}) => {
  const data = node.data;
  const hasChildren = (data.children?.length ?? 0) > 0;
  const isAttr = data.type === 'attr';
  const isWaldur = data.type === 'waldur_attr';
  const handleToggle = () => hasChildren && node.toggle();
  const handleKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!hasChildren) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      node.toggle();
    }
  };
  const { paddingLeft: _ignored, ...positionStyle } = style;
  const guides = Array.from({ length: node.level });
  return (
    <div
      ref={dragHandle}
      style={positionStyle}
      className={`ldap-tree-row d-flex align-items-stretch ${
        node.isSelected ? 'bg-light-primary' : ''
      }`}
      onClick={handleToggle}
      onKeyDown={handleKey}
      role="treeitem"
      aria-selected={node.isSelected}
      tabIndex={0}
    >
      {guides.map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="ldap-tree-guide flex-shrink-0"
          style={{
            width: INDENT_PX,
            borderLeft: '1px dashed var(--bs-gray-300)',
            marginLeft: i === 0 ? 4 : 0,
          }}
        />
      ))}
      <div className="d-flex align-items-center px-2 py-1 flex-grow-1 min-w-0">
        <span
          className="me-1 text-quaternary d-inline-flex"
          style={{ width: 14 }}
        >
          {hasChildren ? (
            node.isOpen ? (
              <CaretDownIcon weight="bold" size={12} />
            ) : (
              <CaretRightIcon weight="bold" size={12} />
            )
          ) : null}
        </span>
        <span
          className={`me-2 d-inline-flex ${
            isWaldur ? 'text-info' : 'text-tertiary'
          }`}
        >
          {iconFor(data.type)}
        </span>
        <span
          className={
            isAttr || isWaldur
              ? `small text-truncate font-monospace ${
                  isWaldur ? 'fst-italic text-info' : 'text-secondary'
                }`
              : 'fw-semibold text-primary text-truncate font-monospace'
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
          <span className={`badge ${data.badge.cls} ms-2 flex-shrink-0`}>
            {data.badge.text}
          </span>
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
      <span className={isWaldur ? 'text-info' : 'text-primary'}>{value}</span>
    </>
  );
};

const matchesQuery = (node: NodeApi<TreeNodeData>, term: string) => {
  const q = term.trim().toLowerCase();
  if (!q) return true;
  if (node.data.name.toLowerCase().includes(q)) return true;
  if (node.data.badge?.text.toLowerCase().includes(q)) return true;
  return false;
};

export const GLAuthTreeView: FC<{ tree: GlauthTree }> = ({ tree }) => {
  const data = useMemo(() => buildTree(tree), [tree]);
  const [search, setSearch] = useState('');
  return (
    <div className="ldap-tree-view">
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
      <div className="border rounded bg-body">
        <Tree<TreeNodeData>
          data={data}
          openByDefault
          rowHeight={28}
          indent={0}
          width="100%"
          height={500}
          disableDrag
          disableDrop
          disableEdit
          disableMultiSelection
          searchTerm={search}
          searchMatch={matchesQuery}
        >
          {NodeRow}
        </Tree>
      </div>
    </div>
  );
};

import { translate } from '@/i18n';

/**
 * Which address of a resource a global search matched, for a resource found
 * by IP rather than by name. A tenant is found by the addresses of its
 * floating IPs, routers, load balancers and ports, which the backend lists
 * in backend_metadata.ip_index; a VM by its own addresses.
 */
export interface IpMatch {
  /** One line naming the matched object and address. */
  label: string;
  /** The resource details tab that lists the matched object. */
  tab?: string;
  /** UUID of the matched object, for a tab that can focus on one. */
  object?: string;
}

type ObjectType = 'floating_ip' | 'router' | 'load_balancer' | 'port';

interface IpIndexEntry {
  address: string;
  type: ObjectType;
  uuid: string;
  name?: string;
  mapped_from?: string;
  attached_to?: { type: ObjectType; name?: string };
}

interface ResourceWithMetadata {
  name?: string;
  backend_metadata?: Record<string, unknown> | null;
}

const TABS: Record<ObjectType, string> = {
  floating_ip: 'floating_ips',
  router: 'routers',
  load_balancer: 'load_balancers',
  port: 'ports',
};

const isObjectType = (value: unknown): value is ObjectType =>
  typeof value === 'string' && value in TABS;

// Floating IPs are usually named after their own address; repeating it in
// the label says nothing, so such a name is left out.
const objectLabel = (type: ObjectType, name: string | undefined, address?) => {
  const shown = name && name !== address ? name : undefined;
  switch (type) {
    case 'floating_ip':
      return shown
        ? translate('Floating IP {name}', { name: shown })
        : translate('Floating IP');
    case 'router':
      return shown
        ? translate('Router {name}', { name: shown })
        : translate('Router');
    case 'load_balancer':
      return shown
        ? translate('Load balancer {name}', { name: shown })
        : translate('Load balancer');
    case 'port':
      return shown
        ? translate('Port {name}', { name: shown })
        : translate('Port');
  }
};

const asList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];

const describeEntry = (entry: IpIndexEntry, exact: boolean): IpMatch => {
  let object = objectLabel(
    entry.type,
    entry.name,
    entry.mapped_from ?? entry.address,
  );
  if (entry.attached_to && isObjectType(entry.attached_to.type)) {
    object = translate('{object} on {target}', {
      object,
      target: objectLabel(entry.attached_to.type, entry.attached_to.name),
    });
  }
  const label = entry.mapped_from
    ? translate('{object}: public IP {address}, mapped from {mapped_from}', {
        object,
        address: entry.address,
        mapped_from: entry.mapped_from,
      })
    : translate('{object}: {address}', { object, address: entry.address });
  return {
    label,
    tab: TABS[entry.type],
    // Only the ports tab can focus on a single object, and only an exact
    // match names the object to focus on: a prefix such as 192.168 matches
    // many ports, and focusing on the first would hide the rest.
    object: exact && entry.type === 'port' ? entry.uuid : undefined,
  };
};

// Addresses are dotted IPv4 or colon-separated IPv6; a query with neither is
// a name or a word, which may happen to occur in an IPv6 address's hex.
const looksLikeAddress = (query: string) => /[.:]/.test(query);

export const getIpMatch = (
  resource: ResourceWithMetadata,
  rawQuery: string,
): IpMatch | null => {
  // The backend matches addresses case-insensitively (icontains).
  const query = rawQuery?.trim().toLowerCase();
  const metadata = resource.backend_metadata;
  if (!query || !metadata) {
    return null;
  }
  // Found by its name: there is no address to explain.
  if (resource.name?.toLowerCase().includes(query)) {
    return null;
  }

  const index = Array.isArray(metadata.ip_index)
    ? (metadata.ip_index as IpIndexEntry[]).filter(
        (entry) =>
          entry &&
          typeof entry.address === 'string' &&
          isObjectType(entry.type),
      )
    : [];
  const exactEntry = index.find(
    (entry) => entry.address.toLowerCase() === query,
  );
  if (exactEntry) {
    return describeEntry(exactEntry, true);
  }

  const vmAddresses: [string[], (address: string) => string][] = [
    [
      asList(metadata.external_address),
      (address) => translate('Mapped public IP {address}', { address }),
    ],
    [
      asList(metadata.external_ips),
      (address) => translate('Floating IP {address}', { address }),
    ],
    [
      asList(metadata.internal_ips),
      (address) => translate('Internal IP {address}', { address }),
    ],
  ];
  for (const [addresses, describe] of vmAddresses) {
    const address = addresses.find((item) => item.toLowerCase() === query);
    if (address) {
      return { label: describe(address) };
    }
  }

  if (!looksLikeAddress(query)) {
    return null;
  }
  const partialEntry = index.find((entry) =>
    entry.address.toLowerCase().includes(query),
  );
  if (partialEntry) {
    return describeEntry(partialEntry, false);
  }
  for (const [addresses, describe] of vmAddresses) {
    const address = addresses.find((item) =>
      item.toLowerCase().includes(query),
    );
    if (address) {
      return { label: describe(address) };
    }
  }
  return null;
};

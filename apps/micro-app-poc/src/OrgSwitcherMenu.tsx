import { translate } from 'waldur-i18n-runtime';
// waldur-js-client is deliberately absent from this app's own package.json
// — same reasoning as packages/api-client/src/requestHelpers.ts and
// packages/auth-core/src/client.ts: resolving it via workspace hoisting
// means this always sees root's exact pinned/linked SDK build, not a
// second, potentially-drifted copy declared here.
import { Customer } from 'waldur-js-client';
import { Menu } from 'waldur-ui';

export interface OrgSwitcherMenuProps {
  customers: Customer[];
  selectedUuid: string | null;
  onSelect: (uuid: string) => void;
  orgName: string;
}

/**
 * OrgSwitcher's dropdown content — the organisation list, a self-contained
 * piece with clear inputs, split out of OrgDashboardMock.tsx the same way
 * UserMenu.tsx is.
 */
export function OrgSwitcherMenu({
  customers,
  selectedUuid,
  onSelect,
  orgName,
}: OrgSwitcherMenuProps) {
  return (
    <>
      <Menu.Label>{translate('Organisations')}</Menu.Label>
      {customers.length > 0 ? (
        // Real role="menuitemradio"/aria-checked selection — see
        // Menu.tsx's comment on Menu.RadioItem.
        <Menu.RadioGroup
          value={selectedUuid ?? undefined}
          onValueChange={onSelect}
        >
          {customers.map((customer) => (
            <Menu.RadioItem key={customer.uuid} value={customer.uuid}>
              {customer.name}
            </Menu.RadioItem>
          ))}
        </Menu.RadioGroup>
      ) : (
        // A lone, non-interactive placeholder — nothing to pick between,
        // so no radio semantics or selection indicator.
        <Menu.Item>{orgName}</Menu.Item>
      )}
    </>
  );
}

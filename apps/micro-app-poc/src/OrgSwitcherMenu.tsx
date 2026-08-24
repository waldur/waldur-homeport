import { translate } from 'waldur-i18n-runtime';
// waldur-js-client is deliberately absent from this app's own package.json
// — same reasoning as packages/api-client/src/requestHelpers.ts and
// packages/auth-core/src/client.ts: resolving it via workspace hoisting
// means this always sees root's exact pinned/linked SDK build, not a
// second, potentially-drifted copy declared here.
import { Customer } from 'waldur-js-client';
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from 'waldur-ui';

export interface OrgSwitcherMenuProps {
  customers: Customer[];
  selectedUuid: string | null;
  onSelect: (uuid: string) => void;
  orgName: string;
}

/**
 * OrgSwitcher's dropdown content — the organisation list, split out the
 * same way UserMenu.tsx is: a self-contained piece with clear inputs,
 * previously inlined in OrgDashboardMock.tsx's TopBar `left` slot.
 */
export function OrgSwitcherMenu({
  customers,
  selectedUuid,
  onSelect,
  orgName,
}: OrgSwitcherMenuProps) {
  return (
    <>
      <DropdownMenuLabel>{translate('Organisations')}</DropdownMenuLabel>
      {customers.length > 0 ? (
        // Real role="menuitemradio"/aria-checked selection — see
        // DropdownMenu.tsx's comment on RadioItem.
        <DropdownMenuRadioGroup
          value={selectedUuid ?? undefined}
          onValueChange={onSelect}
        >
          {customers.map((customer) => (
            <DropdownMenuRadioItem key={customer.uuid} value={customer.uuid}>
              {customer.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      ) : (
        // A lone, non-interactive placeholder — nothing to pick between,
        // so no radio semantics or selection indicator.
        <DropdownMenuItem>{orgName}</DropdownMenuItem>
      )}
    </>
  );
}

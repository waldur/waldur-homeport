import {
  ArrowClockwiseIcon,
  BuildingsIcon,
  ClipboardTextIcon,
  SquaresFourIcon,
  UserIcon,
} from '@phosphor-icons/react';

import { Link } from '@/core/Link';
import { useModal } from '@/modal/actions';
import { useOrganizationAndProjectAutocompletesForResources } from '@/navigation/sidebar/resources-filter/utils';

import { getResourceFilterFromSearchItem } from './utils';

export const RecentSearchItem = ({ item }) => {
  const { closeDialog } = useModal();
  const { syncResourceFilters } =
    useOrganizationAndProjectAutocompletesForResources();

  if (!item.to) return null;

  return (
    <Link
      className="flex text-brand items-center py-1.5 px-4 hover:bg-[var(--bg-brand-primary-alt)]"
      state={item.to}
      params={item.params}
      onClick={() => {
        syncResourceFilters(getResourceFilterFromSearchItem(item));
        closeDialog();
      }}
    >
      {item.type === 'organization' ? (
        <BuildingsIcon
          size={22}
          weight="bold"
          className="text-secondary me-3"
        />
      ) : item.type === 'project' ? (
        <ClipboardTextIcon
          size={22}
          weight="bold"
          className="text-secondary me-3"
        />
      ) : item.type === 'user' ? (
        <UserIcon size={22} weight="bold" className="text-secondary me-3" />
      ) : (
        <SquaresFourIcon
          size={22}
          weight="bold"
          className="text-secondary me-3"
        />
      )}
      <span className="text-sm grow">{item.title}</span>
      <ArrowClockwiseIcon size={20} className="text-primary" weight="bold" />
    </Link>
  );
};

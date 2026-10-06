import { StarIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { ComponentPropsWithoutRef, MouseEvent } from 'react';

import { Link } from '@/core/Link';
import { ItemImage } from '@/navigation/workspace/context-selector/ItemImage';

import '../search/SearchItem.scss';

/** What a breadcrumb dropdown's row links to and shows. */
export interface BreadcrumbItem {
  to: string;
  params?: { [key: string]: string };
  title: string;
  subtitle?: string;
  image?: string;
  /** Whether this is the page the crumb stands for. */
  isCurrent?: boolean;
}

interface BreadcrumbSearchItemProps {
  /** The row data (BreadcrumbDropdown). */
  item: BreadcrumbItem & { value: string; id: string };
  favorite: boolean;
  /** Whether the row is the combobox's highlighted option. */
  highlighted: boolean;
  onToggleFavorite: (event: MouseEvent) => void;
  /** Downshift's getItemProps for this option. */
  itemProps?: Omit<ComponentPropsWithoutRef<typeof Link>, 'state'>;
}

/**
 * A row of BreadcrumbDropdown: an option of its downshift listbox, rendered as the
 * link it opens, so a pointer can still open it in a new tab. Arrow keys
 * highlight it while focus stays in the search box, and Enter opens it.
 *
 * An option takes no interactive children, so the favourite star sits beside
 * it, for the pointer only; the keyboard toggles it with the dropdown's
 * Ctrl/Cmd+D shortcut.
 */
export const BreadcrumbSearchItem = ({
  item,
  favorite,
  highlighted,
  onToggleFavorite,
  itemProps,
}: BreadcrumbSearchItemProps) => {
  return (
    <div
      className={classNames(
        // bg-state-primary-50: the hover background, also on .active, the
        // highlighted row, so the keyboard highlight looks like the
        // pointer's in either theme (Metronic compiles it per theme). The
        // brand bar marks it besides: it is a keyboard user's only focus
        // indicator. The current row is not tinted: bg-light-primary
        // resolves to this same primary-50, so it read as permanently
        // hovered and gave no hover feedback; aria-current marks it instead.
        'search-result-item d-flex align-items-center pe-5 bg-state-primary-50',
        highlighted && 'active shadow-[inset_3px_0_0_var(--bs-primary)]',
      )}
    >
      <Link
        {...itemProps}
        state={item.to}
        params={item.params}
        // Focus stays in the search box; the option is highlighted
        // through aria-activedescendant, not focused.
        tabIndex={-1}
        aria-current={item.isCurrent ? 'page' : undefined}
        // pe-4 keeps a long title off the favourite star, which always holds
        // its place beside the link; as padding it stays part of the link.
        className="d-flex flex-grow-1 min-w-0 text-dark text-hover-primary align-items-center py-2 ps-5 pe-4"
      >
        {/* Decorative: the title follows, so the option isn't named by
            the avatar's initials too. */}
        <span aria-hidden="true" className="d-flex flex-shrink-0">
          <ItemImage
            item={{ image: item.image, name: item.title }}
            className="me-4"
            circle
          />
        </span>
        {/* Blocks, not spans, so the option's name has a break between
            them ("Project Organization", not "ProjectOrganization"). */}
        <div className="d-flex flex-column justify-content-start fw-semibold">
          <div className="fs-6 fw-semibold">{item.title}</div>
          {Boolean(item.subtitle) && (
            <div className="fs-7 fw-semibold text-muted">{item.subtitle}</div>
          )}
        </div>
      </Link>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className={classNames('btn-fav', favorite && 'show')}
        onClick={onToggleFavorite}
      >
        {favorite ? (
          <StarIcon size={20} weight="fill" className="text-warning" />
        ) : (
          <StarIcon size={20} className="text-dark" weight="bold" />
        )}
      </button>
    </div>
  );
};

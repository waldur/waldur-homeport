import { PlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import type { CidrPolicy } from 'waldur-js-client';

import { BaseButton, FormText, Input } from 'waldur-ui';

import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { RemovalActionButton } from '@/table/RemovalActionButton';

import {
  getCidrPlaceholder,
  MAX_CIDR_ITEMS,
  validateNetworkList,
} from './cidrOptions';

/**
 * Editable list of networks in CIDR form, each checked against the policy as
 * it is typed; the length and overlaps between entries are checked on the
 * list. Used for a cidr option with `multiple`, an IPsec option's remote
 * subnets, and the ranges of a provider's policy.
 */
export const CidrListEditor: FC<{
  values: string[];
  onChange: (values: string[]) => void;
  policy?: CidrPolicy;
  /** Names an entry for screen readers and messages: "Network 2". */
  itemLabel?: (position: number) => string;
  addLabel?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  /** Show the errors of entries left empty, once a submit has been tried. */
  showEmptyErrors?: boolean;
  /** An empty list is a mistake, not a choice. */
  required?: boolean;
  /**
   * Show one empty row instead of the empty state, so the first network can
   * be typed at once. The value stays empty until something is typed.
   */
  startWithRow?: boolean;
  /** A problem found outside the list, such as an overlap with another option. */
  listError?: string;
  /**
   * Keep at least one row: a list that must hold a network has no remove
   * button on its last row.
   */
  keepOneRow?: boolean;
  /** An example network; by default one the policy accepts. */
  placeholder?: string;
  disabled?: boolean;
}> = ({
  values,
  onChange,
  policy = {},
  itemLabel = (position) => translate('Network {position}', { position }),
  addLabel = translate('Add network'),
  emptyTitle = translate('No networks'),
  emptyMessage,
  showEmptyErrors,
  required,
  startWithRow,
  listError,
  keepOneRow,
  placeholder: givenPlaceholder,
  disabled,
}) => {
  const rows = values.length || !startWithRow ? values : [''];
  const errors = validateNetworkList(values, policy, {
    allowEmpty: !required || !showEmptyErrors,
  });
  const limit = Math.min(policy.max_items || MAX_CIDR_ITEMS, MAX_CIDR_ITEMS);
  const full = values.length >= limit;
  const placeholder = givenPlaceholder ?? getCidrPlaceholder(policy);
  const removable = !keepOneRow || rows.length > 1;
  const update = (index: number, value: string) =>
    onChange(rows.map((current, i) => (i === index ? value : current)));
  const remove = (index: number) =>
    onChange(rows.filter((_, i) => i !== index));
  return (
    <div data-testid="cidr-list-editor">
      {rows.length ? (
        <ul className="list-none p-0 m-0">
          {rows.map((value, index) => {
            const position = index + 1;
            const error =
              value || showEmptyErrors ? errors.items[index] : undefined;
            return (
              <li key={index} className="mb-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={value}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-label={itemLabel(position)}
                    invalid={Boolean(error)}
                    onChange={(event) =>
                      update(index, event.target.value.trim())
                    }
                  />
                  {removable && (
                    <RemovalActionButton
                      size="md"
                      onClick={() => remove(index)}
                      disabled={disabled}
                      aria-label={translate('Remove {item}', {
                        item: itemLabel(position),
                      })}
                    />
                  )}
                </div>
                {error && <FormText variant="danger">{error}</FormText>}
              </li>
            );
          })}
        </ul>
      ) : (
        <NoResult title={emptyTitle} message={emptyMessage} noAction />
      )}
      {(errors.list || listError) && (
        <FormText variant="danger" className="mb-2" role="alert">
          {errors.list || listError}
        </FormText>
      )}
      <BaseButton
        className="mt-1"
        label={addLabel}
        onClick={() => onChange([...rows, ''])}
        iconNode={<PlusIcon weight="bold" />}
        variant="tertiary"
        size="sm"
        disabled={disabled || full}
        disabledReason={
          full
            ? translate('At most {count} networks.', { count: limit })
            : undefined
        }
      />
    </div>
  );
};

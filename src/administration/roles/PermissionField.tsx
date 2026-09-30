import * as Tabs from '@radix-ui/react-tabs';
import classNames from 'classnames';
import { FC, useEffect, useMemo, useState } from 'react';

import { Badge, BadgeVariant } from 'waldur-ui';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { PermissionOptions } from './PermissionOptions';

interface PermissionOption {
  label: string;
  value: string;
}

interface PermissionEntity {
  label: string;
  options: PermissionOption[];
  selectedCount: number;
  matches: PermissionOption[];
}

interface PermissionFieldProps {
  input: {
    value: string[];
    onChange: (value: string[]) => void;
  };
}

/**
 * How much of a group is granted, as the light badge tones the design uses:
 * grey when empty, amber when partial, green when complete.
 */
const getCoverage = (
  selectedCount: number,
  total: number,
): { label: string; variant: BadgeVariant } =>
  selectedCount === 0
    ? { label: translate('None'), variant: 'neutral' }
    : selectedCount === total
      ? { label: translate('Full'), variant: 'success' }
      : { label: translate('Partial'), variant: 'warning' };

const TAB_TRIGGER_BASE =
  'flex items-center justify-between w-full min-h-[36px] py-[7px] px-3 border-y-0 border-r-0 border-l-2 rounded-none bg-transparent text-sm leading-5 text-left cursor-pointer transition-colors hover:text-brand-600 disabled:opacity-40 disabled:cursor-not-allowed';

/**
 * Custom hook managing search filtering across permission groups,
 * tracking selected permissions, and ensuring an active group is always selected.
 */
const usePermissionGroups = (selected: string[], query: string) => {
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const [activeKey, setActiveKey] = useState(PermissionOptions[0].label);

  const term = query.trim().toLowerCase();

  const groups: PermissionEntity[] = useMemo(
    () =>
      PermissionOptions.map((entity) => ({
        label: entity.label,
        options: entity.options,
        selectedCount: entity.options.filter((option) =>
          selectedSet.has(option.value),
        ).length,
        // Codes are matched as well as labels: they are the identifiers the API
        // and the permission checks use, so an admin looking for
        // `OFFERING.UPDATE` should find it by typing exactly that.
        matches: entity.options.filter(
          (option) =>
            !term ||
            option.label.toLowerCase().includes(term) ||
            option.value.toLowerCase().includes(term),
        ),
      })),
    [term, selectedSet],
  );

  // A search that empties the open group would leave a dead panel; move to the
  // first group that still has something to show.
  useEffect(() => {
    if (
      groups.find((group) => group.label === activeKey)?.matches.length === 0
    ) {
      const next = groups.find((group) => group.matches.length > 0);
      if (next) {
        setActiveKey(next.label);
      }
    }
  }, [groups, activeKey]);

  const activeGroup =
    groups.find((group) => group.label === activeKey) ?? groups[0];

  const hasMatches = groups.some((entity) => entity.matches.length > 0);

  return {
    groups,
    activeKey,
    setActiveKey,
    activeGroup,
    selectedSet,
    hasMatches,
  };
};

interface PermissionGroupTabProps {
  entity: PermissionEntity;
  isActive: boolean;
}

const PermissionGroupTab: FC<PermissionGroupTabProps> = ({
  entity,
  isActive,
}) => {
  const coverage = getCoverage(entity.selectedCount, entity.options.length);

  return (
    <Tabs.Trigger
      key={entity.label}
      value={entity.label}
      disabled={entity.matches.length === 0}
      className={classNames(
        TAB_TRIGGER_BASE,
        isActive
          ? 'border-l-brand-600 text-brand-600 font-semibold active'
          : 'border-l-transparent text-[var(--surface-text-secondary)] font-medium',
      )}
    >
      <span>{entity.label}</span>
      <Badge
        variant={coverage.variant}
        size="sm"
        shape="pill"
        tone="outline"
        className="min-w-[62px] justify-center flex-shrink-0"
      >
        {coverage.label}
      </Badge>
    </Tabs.Trigger>
  );
};

interface PermissionOptionsPanelProps {
  activeGroup: PermissionEntity;
  selectedSet: Set<string>;
  onToggleOption: (value: string, checked: boolean) => void;
  onToggleShown: (checked: boolean) => void;
}

const PermissionOptionsPanel: FC<PermissionOptionsPanelProps> = ({
  activeGroup,
  selectedSet,
  onToggleOption,
  onToggleShown,
}) => {
  const shown = activeGroup.matches;
  const allShownSelected =
    shown.length > 0 && shown.every((option) => selectedSet.has(option.value));

  return (
    <Tabs.Content
      value={activeGroup.label}
      className="border-t md:border-t-0 md:border-l border-[var(--waldur-border-secondary)] pt-4 md:ps-4 outline-none"
    >
      <p className="text-muted text-sm font-medium leading-5 mb-4">
        {activeGroup.label}
      </p>
      <AwesomeCheckbox
        id="permission-select-all"
        className="min-h-[22px] mb-2"
        type="checkbox"
        size="sm"
        label={translate('Select all')}
        value={allShownSelected}
        onChange={onToggleShown}
      />
      <hr className="mt-0 mb-2" />
      {shown.map((option: PermissionOption) => (
        <AwesomeCheckbox
          className="min-h-[22px] mb-2"
          key={option.value}
          id={`permission-${option.value}`}
          type="checkbox"
          size="sm"
          label={option.label}
          value={selectedSet.has(option.value)}
          onChange={(checked: boolean) => onToggleOption(option.value, checked)}
        />
      ))}
    </Tabs.Content>
  );
};

/**
 * Permissions outgrew a flat stack of accordions: there are 130+ of them across
 * 13 groups. Groups run down the left with a None/Partial/Full read-out; the
 * open group's permissions are ticked on the right.
 */
export const PermissionField = (props: PermissionFieldProps) => {
  // react-final-form hands an empty array field over as '' until it is touched.
  const selected: string[] = useMemo(
    () => (Array.isArray(props.input.value) ? props.input.value : []),
    [props.input.value],
  );

  const [query, setQuery] = useState('');
  const {
    groups,
    activeKey,
    setActiveKey,
    activeGroup,
    selectedSet,
    hasMatches,
  } = usePermissionGroups(selected, query);

  const toggleOption = (value: string, checked: boolean) =>
    props.input.onChange(
      checked
        ? [...selected, value]
        : selected.filter((permission) => permission !== value),
    );

  // Bulk selection acts on what the search actually shows, so narrowing to
  // "delete" and ticking "Select all" cannot silently grant the whole group.
  const toggleShown = (checked: boolean) => {
    const values = activeGroup.matches.map((option) => option.value);
    props.input.onChange(
      checked
        ? [...selected, ...values.filter((value) => !selectedSet.has(value))]
        : selected.filter((permission) => !values.includes(permission)),
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <FilterBox
        // The enclosing FormGroup pushes its `controlId` onto every unlabelled
        // control below it, so the search box and the checkboxes would all
        // share one id. Everything here names its own.
        id="permission-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={translate('Search...')}
        className="mb-4"
      />
      <hr className="m-0" />
      {!hasMatches ? (
        <NoResult
          title={translate('No permissions found')}
          message={translate('No permission matches this search.')}
          callback={() => setQuery('')}
        />
      ) : (
        <Tabs.Root
          value={activeKey}
          onValueChange={setActiveKey}
          orientation="vertical"
          className="grid grid-cols-1 md:grid-cols-2 flex-1"
        >
          <div className="pt-4 md:pe-4">
            <p className="text-muted text-sm font-medium leading-5 mb-4">
              {translate('Permissions')}
            </p>
            <Tabs.List
              aria-label={translate('Permissions')}
              className="flex flex-col m-0 p-0"
            >
              {groups.map((entity) => (
                <PermissionGroupTab
                  key={entity.label}
                  entity={entity}
                  isActive={activeKey === entity.label}
                />
              ))}
            </Tabs.List>
          </div>

          <PermissionOptionsPanel
            activeGroup={activeGroup}
            selectedSet={selectedSet}
            onToggleOption={toggleOption}
            onToggleShown={toggleShown}
          />
        </Tabs.Root>
      )}
    </div>
  );
};

/** "2/12 groups · 18 permissions" — the footer read-out of the whole role. */
export const getPermissionSummary = (selected: string[]) => {
  const selectedSet = new Set(selected);
  const touched = PermissionOptions.filter((entity) =>
    entity.options.some((option) => selectedSet.has(option.value)),
  ).length;
  return translate('{touched}/{total} groups · {count} permissions', {
    touched,
    total: PermissionOptions.length,
    count: selected.length,
  });
};

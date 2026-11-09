import { FC, ReactNode, useContext, useMemo } from 'react';

import { SelectField } from '@/form';
import { DateField } from '@/form/DateField';
import { DateTimeField } from '@/form/DateTimeField';
import { NumberField } from '@/form/NumberField';
import { RangeDateField } from '@/form/RangeDateField';
import { RangeNumberField } from '@/form/RangeNumberField';
import { AsyncSelect } from '@/form/select';
import { StringField } from '@/form/StringField';
import { SwitchField } from '@/form/SwitchField';

import {
  facetKey,
  MAX_FACET_LIMIT,
  useHasTableFacets,
  useTableFacet,
} from './facets';
import { TableFilterContext } from './FilterContextProvider';
import { useNormalizeSelectFilterValue } from './normalizeFilterValue';
import { withTableFilter } from './withTableFilter';

// In the mobile sidebar several filters can be expanded at once; a menu
// that never closes would pile every one of them on top of the rows below.
// There the select opens on focus and closes on blur like any dropdown.
const useMenuAlwaysOpen = () =>
  useContext(TableFilterContext).filterPosition !== 'sidebar';

const defaultOptionValue = (option) => option?.value;
const defaultOptionLabel = (option) => option?.label;

/** Shows each option's count after its label in the menu, not in the chip.
 * A filter's own `formatOptionLabel` still draws the label. One wrapping
 * element, an inline flex row: the option clamps its children, and a label
 * that is a block (a project's name and industry flag) keeps the count on
 * its line. */
const countedLabel =
  (counts: Map<string, number>, getValue, getLabel, formatLabel?) =>
  (option, meta): ReactNode => {
    const label = formatLabel ? formatLabel(option, meta) : getLabel(option);
    const count = counts.get(facetKey(getValue(option)));
    if (meta?.context !== 'menu' || count === undefined) return label;
    return (
      <span>
        <span className="inline-flex items-center gap-1">
          {label}
          <span className="text-tertiary">({count})</span>
        </span>
      </span>
    );
  };

/** The options whose value the facet still has, plus the current
 * selection, which must stay visible and removable. */
export const limitToFacet = <T,>(
  options: T[] | undefined,
  counts: Map<string, number>,
  selected: unknown,
  getValue: (option: T) => unknown,
): T[] => {
  const selectedKeys = new Set(
    [selected]
      .flat()
      .filter((value) => value !== null && value !== undefined)
      .map((value) =>
        facetKey(typeof value === 'object' ? getValue(value as T) : value),
      ),
  );
  return (options ?? []).filter((option) => {
    const key = facetKey(getValue(option));
    return counts.has(key) || selectedKeys.has(key);
  });
};

// A value restored from a URL as plain text, for a filter whose options are
// its facet's values and so not known yet.
const rawFacetOption = (raw: string | number) => ({
  value: raw,
  label: String(raw),
});

const defaultFacetOption = (value) => ({
  value: value.value,
  label: value.label,
});

/** The options plus any selected one they lack, so it stays removable. */
const withSelection = <T,>(
  options: T[],
  selected: unknown,
  getValue: (option: T) => unknown,
): T[] => {
  const keys = new Set(options.map((option) => facetKey(getValue(option))));
  const missing = [selected]
    .flat()
    .filter(
      (value) =>
        value !== null &&
        typeof value === 'object' &&
        !keys.has(facetKey(getValue(value as T))),
    ) as T[];
  return [...options, ...missing];
};

/**
 * A select field whose options the table's facet limits. It is what
 * withTableFilter wraps, so the facet is counted only once the filter's field
 * is shown, not when the table registers its filters.
 */
const FacetedSelectField: FC<any> = ({ facet, facetOption, ...props }) => {
  // The select searches only the options it holds, so it asks for all of
  // them, not the first hundred.
  const tableFacet = useTableFacet(facet, MAX_FACET_LIMIT);
  const getValue = props.getOptionValue ?? defaultOptionValue;
  const getLabel = props.getOptionLabel ?? defaultOptionLabel;
  const counts = tableFacet?.counts;
  const values = tableFacet?.facet?.values;
  const selected = props.input?.value;
  const faceted = useMemo(() => {
    if (props.options === undefined) {
      // No fixed options: the facet's values are the options, e.g. a status
      // synced from a service desk that no list in the client could name.
      const toOption = facetOption ?? defaultFacetOption;
      return {
        options: withSelection(
          (values ?? []).map(toOption),
          selected,
          getValue,
        ),
        ...(counts && {
          formatOptionLabel: countedLabel(
            counts,
            getValue,
            getLabel,
            props.formatOptionLabel,
          ),
        }),
      };
    }
    // Until the first count arrives the filter offers every option.
    if (!counts) return {};
    const options =
      typeof props.options === 'function' ? props.options() : props.options;
    return {
      options: limitToFacet(options, counts, selected, getValue),
      formatOptionLabel: countedLabel(
        counts,
        getValue,
        getLabel,
        props.formatOptionLabel,
      ),
    };
    // getValue/getLabel/facetOption are usually inline; their behaviour does
    // not change.
  }, [counts, values, props.options, props.formatOptionLabel, selected]);
  return <SelectField {...props} {...faceted} />;
};

/** An async select field listing the table's facet instead of loadOptions. */
const FacetedAsyncSelectField: FC<any> = ({ facet, facetOption, ...props }) => {
  const tableFacet = useTableFacet(facet);
  const getValue = props.getOptionValue ?? defaultOptionValue;
  const getLabel = props.getOptionLabel ?? defaultOptionLabel;
  const toOption = facetOption ?? defaultFacetOption;
  const faceted = tableFacet && {
    loadOptions: async (search: string) => ({
      options: (await tableFacet.loadValues(search ?? '')).map(toOption),
      hasMore: false,
    }),
    // Reload the menu when the table's filters or search change; loadOptions
    // itself waits for the first count.
    cacheUniqs: [tableFacet.cacheKey, ...(props.cacheUniqs ?? [])],
    ...(tableFacet.counts && {
      formatOptionLabel: countedLabel(
        tableFacet.counts,
        getValue,
        getLabel,
        props.formatOptionLabel,
      ),
    }),
  };
  return <AsyncSelect {...props} {...faceted} />;
};

const AutonomousSelectFilter = withTableFilter(SelectField);
const AutonomousFacetedSelectFilter = withTableFilter(FacetedSelectField);

/**
 * `facet` names the table's facet (see `./facets`) whose values limit the
 * options; without it, or on a table with no `facets`, every option shows.
 * Without `options`, the facet's values are the options, built with
 * `facetOption` (default `{ value, label }`).
 */
export const SelectFilter: FC<any> = ({ facet, facetOption, ...props }) => {
  const hasFacets = useHasTableFacets();
  const faceted = !!facet && hasFacets;
  useNormalizeSelectFilterValue(
    props.name,
    !!props.isMulti,
    props.options,
    faceted && props.options === undefined ? rawFacetOption : undefined,
  );
  const menuAlwaysOpen = useMenuAlwaysOpen();
  const Filter = faceted
    ? AutonomousFacetedSelectFilter
    : AutonomousSelectFilter;
  return (
    <Filter
      variant="tableFilter"
      menuAlwaysOpen={menuAlwaysOpen}
      {...props}
      {...(faceted && { facet, facetOption })}
    />
  );
};

const AutonomousAsyncSelectFilter = withTableFilter(AsyncSelect);
const AutonomousFacetedAsyncSelectFilter = withTableFilter(
  FacetedAsyncSelectField,
);

/**
 * `facet` names the table's facet whose values replace `loadOptions`;
 * `facetOption` turns a facet value into this filter's option shape
 * (see `facetOption()` in `./facets`).
 */
export const AsyncSelectFilter: FC<any> = ({
  facet,
  facetOption,
  ...props
}) => {
  useNormalizeSelectFilterValue(props.name, !!props.isMulti);
  const menuAlwaysOpen = useMenuAlwaysOpen();
  const hasFacets = useHasTableFacets();
  const faceted = !!facet && hasFacets;
  const Filter = faceted
    ? AutonomousFacetedAsyncSelectFilter
    : AutonomousAsyncSelectFilter;
  return (
    <Filter
      variant="tableFilter"
      menuAlwaysOpen={menuAlwaysOpen}
      {...props}
      {...(faceted && { facet, facetOption })}
    />
  );
};

export const BooleanFilter = withTableFilter(SwitchField, {
  passLabelToControl: true,
});

export const StringFilter = withTableFilter(StringField);

// The date filters open their calendar as soon as the filter is picked,
// the way SelectFilter/AsyncSelectFilter show their menu (`variant=
// "tableFilter"`): choosing the filter already says "I want to pick a
// date". Every entry point mounts the field only then — the "Add filter"
// row once opened, the column flyout once shown, the mobile accordion row
// once expanded — so this never fires for filters nobody opened.
const AutonomousDateFilter = withTableFilter(DateField);
export const DateFilter: typeof AutonomousDateFilter = (props) => (
  <AutonomousDateFilter autoOpen {...props} />
);

const AutonomousDateTimeFilter = withTableFilter(DateTimeField);
/** @public */
export const DateTimeFilter: typeof AutonomousDateTimeFilter = (props) => (
  <AutonomousDateTimeFilter autoOpen {...props} />
);

/** @public */
export const NumberFilter = withTableFilter(NumberField);

export const NumberRangeFilter = withTableFilter(RangeNumberField);

const AutonomousDateRangeFilter = withTableFilter(RangeDateField);
export const DateRangeFilter: typeof AutonomousDateRangeFilter = (props) => (
  <AutonomousDateRangeFilter autoOpen {...props} />
);

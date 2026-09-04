import { useEffect, useMemo, useState } from 'react';
import { Col, Nav, Row } from 'react-bootstrap';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { Badge } from '@/core/Badge';
import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { PermissionOptions } from './PermissionOptions';

// `.page-tabs-container` (the app's vertical tab treatment) lives in this
// stylesheet, which otherwise only loads when PageBarTabs itself renders.
import '@/marketplace/common/PageBarTabs.scss';
import './PermissionField.scss';

interface PermissionOption {
  label: string;
  value: string;
}

/**
 * How much of a group is granted, as the light badge tones the design uses:
 * grey when empty, amber when partial, green when complete. `light` rather
 * than `secondary` for the empty case — Waldur's `secondary` is a brand-tinted
 * neutral (--bs-secondary is #f1f7ef), so it reads green, not grey.
 */
const getCoverage = (selectedCount: number, total: number) =>
  selectedCount === 0
    ? { label: translate('None'), variant: 'light' }
    : selectedCount === total
      ? { label: translate('Full'), variant: 'success' }
      : { label: translate('Partial'), variant: 'warning' };

/**
 * Permissions outgrew a flat stack of accordions: there are 130+ of them across
 * 13 groups. Groups run down the left with a None/Partial/Full read-out; the
 * open group's permissions are ticked on the right.
 */
export const PermissionField = (props) => {
  // react-final-form hands an empty array field over as '' until it is touched.
  const selected: string[] = useMemo(
    () => (Array.isArray(props.input.value) ? props.input.value : []),
    [props.input.value],
  );
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const [query, setQuery] = useState('');
  const [activeKey, setActiveKey] = useState(PermissionOptions[0].label);

  const term = query.trim().toLowerCase();

  const groups = useMemo(
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
  const shown = activeGroup.matches;
  const allShownSelected =
    shown.length > 0 && shown.every((option) => selectedSet.has(option.value));

  const toggleOption = (value: string, checked: boolean) =>
    props.input.onChange(
      checked
        ? [...selected, value]
        : selected.filter((permission) => permission !== value),
    );

  // Bulk selection acts on what the search actually shows, so narrowing to
  // "delete" and ticking "Select all" cannot silently grant the whole group.
  const toggleShown = (checked: boolean) => {
    const values = shown.map((option: PermissionOption) => option.value);
    props.input.onChange(
      checked
        ? [...selected, ...values.filter((value) => !selectedSet.has(value))]
        : selected.filter((permission) => !values.includes(permission)),
    );
  };

  return (
    <div className="permission-picker">
      <FilterBox
        // The enclosing FormGroup pushes its `controlId` onto every unlabelled
        // control below it, so the search box and the checkboxes would all
        // share one id. Everything here names its own.
        id="permission-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={translate('Search...')}
        className="permission-picker__search"
      />
      <hr className="permission-picker__divider" />
      {groups.every((entity) => entity.matches.length === 0) ? (
        <NoResult
          title={translate('No permissions found')}
          message={translate('No permission matches this search.')}
          callback={() => setQuery('')}
        />
      ) : (
        <Row className="permission-picker__panes">
          <Col md={6} className="permission-picker__groups">
            <p className="text-muted permission-picker__heading">
              {translate('Permissions')}
            </p>
            {/*
            The app's vertical tabs: `.page-tabs-container` stacks the nav and
            marks the active item with a left brand bar (see PageBarTabs.scss),
            the same treatment the deploy and proposal screens get via
            @/wizard's FormSteps.
          */}
            <Nav
              // Deliberately no variant="tabs": `.nav.nav-tabs … .badge` repaints
              // any badge inside the active/hovered tab in brand colours, which
              // would wipe out the None/Partial/Full colour coding. The vertical
              // layout comes from `.page-tabs-container`, which needs only `.nav`.
              className="page-tabs-container nav-line-tabs permission-picker__tabs"
              activeKey={activeKey}
              onSelect={setActiveKey}
            >
              {groups.map((entity) => {
                const coverage = getCoverage(
                  entity.selectedCount,
                  entity.options.length,
                );
                return (
                  <Nav.Item key={entity.label}>
                    <Nav.Link
                      eventKey={entity.label}
                      disabled={entity.matches.length === 0}
                      className="flex-grow-1 d-flex justify-content-between align-items-center"
                    >
                      {entity.label}
                      <Badge variant={coverage.variant} size="sm" pill outline>
                        {coverage.label}
                      </Badge>
                    </Nav.Link>
                  </Nav.Item>
                );
              })}
            </Nav>
          </Col>

          <Col md={6} className="border-start permission-picker__options">
            <p className="text-muted permission-picker__heading">
              {activeGroup.label}
            </p>
            <AwesomeCheckbox
              id="permission-select-all"
              className="permission-picker__option"
              type="checkbox"
              size="sm"
              label={translate('Select all')}
              value={allShownSelected}
              onChange={toggleShown}
            />
            <hr className="permission-picker__list-divider" />
            {shown.map((option: PermissionOption) => (
              <AwesomeCheckbox
                className="permission-picker__option"
                key={option.value}
                id={`permission-${option.value}`}
                type="checkbox"
                size="sm"
                label={option.label}
                value={selectedSet.has(option.value)}
                onChange={(checked: boolean) =>
                  toggleOption(option.value, checked)
                }
              />
            ))}
          </Col>
        </Row>
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

import {
  ArrowClockwiseIcon,
  ArrowSquareOutIcon,
  CheckIcon,
  KeyIcon,
  KeyboardIcon,
  PlayIcon,
  SlidersIcon,
  UserIcon,
} from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo, useState } from 'react';
import { DropdownItem } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { GRID_BREAKPOINTS } from '@/core/constants';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { Link } from '@/core/Link';
import { FilterBox } from '@/form/FilterBox';
import { SubmitButton } from '@/form/SubmitButton';
import { Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';
import { ActionButton } from '@/table/ActionButton';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

import { SCRIPT_ROWS } from './utils';

interface ScriptEditorHeaderProps {
  offering: Offering;
  script;
  executing;
  submitting;
  onChangeScript;
  onDryRun;
  onSave;
  onReset;
  dirty;
}

interface EnvItem {
  label;
  value;
  type: 'environ' | 'options' | 'resource_options' | 'roles' | 'link';
}

const envLinks: EnvItem[] = [
  {
    label: translate('Edit user input'),
    type: 'link',
    value: 'options',
  },
  {
    label: translate('Edit resource options'),
    type: 'link',
    value: 'resource_options',
  },
  {
    label: translate('Edit roles'),
    type: 'link',
    value: 'roles',
  },
];

export const ScriptEditorHeader: FC<ScriptEditorHeaderProps> = ({
  offering,
  script,
  executing,
  submitting,
  onChangeScript,
  onDryRun,
  onSave,
  onReset,
  dirty,
}) => {
  const { state } = useCurrentStateAndParams();
  const [query, setQuery] = useState('');

  const envItems = useMemo<EnvItem[]>(() => {
    const items = [];
    ((offering.secret_options?.environ as any[]) || []).forEach((variable) => {
      items.push({
        label: variable.name,
        type: 'environ',
        value: variable.value,
      });
    });
    (offering.options?.order || []).forEach((key) => {
      items.push({
        label: offering.options.options[key].label,
        type: 'options',
        value: key,
      });
    });
    (offering.resource_options?.order || []).forEach((key) => {
      if (items.some((item) => item.value === key && item.type === 'options'))
        return;
      items.push({
        label: offering.resource_options.options[key].label,
        type: 'resource_options',
        value: key,
      });
    });
    return items;
  }, [offering]);

  const filteredEnvItems = useMemo<EnvItem[]>(() => {
    const q = query.trim().toLowerCase();
    let items;
    if (!q) items = envItems;
    else {
      items = envItems.filter(
        (item) =>
          String(item.label).toLowerCase().includes(q) ||
          String(item.value).toLowerCase().includes(q),
      );
    }
    return items.concat(envLinks);
  }, [query, envItems]);

  const isSmallScr = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.xl });

  return (
    <>
      <div className="d-flex gap-4">
        <Select
          options={SCRIPT_ROWS.slice(1)}
          value={script}
          getOptionValue={(option) => option.type}
          onChange={onChangeScript}
          isDisabled={submitting || executing}
          className={isSmallScr ? 'w-250px' : 'w-300px'}
        />

        <SubmitButton
          submitting={submitting || executing}
          disabled={!dirty}
          onClick={onSave}
          type="button"
          iconNode={<CheckIcon weight="bold" />}
          iconOnLeft
        >
          {isSmallScr ? translate('Save') : translate('Save script')}
        </SubmitButton>
        <ActionButton
          action={onReset}
          variant="secondary"
          disabled={submitting || !dirty}
          disabledReason={
            submitting
              ? translate('Saving in progress')
              : translate('No changes to reset')
          }
          iconNode={<ArrowClockwiseIcon weight="bold" />}
          title={isSmallScr ? translate('Reset') : translate('Reset to saved')}
        />
        <ActionButton
          variant="secondary"
          action={onDryRun}
          disabled={submitting}
          disabledReason={translate('Saving in progress')}
          pending={executing}
          className="text-nowrap"
          iconNode={<PlayIcon weight="bold" />}
          title={
            isSmallScr ? translate('Dry run') : translate('Dry run script')
          }
        />
      </div>
      <ActionsDropdownComponent
        label={
          isSmallScr
            ? translate('Env variables')
            : translate('Environment variables')
        }
        labeled
        menuStyle={{ zIndex: 1056 }}
        drop="down"
      >
        <FilterBox
          type="search"
          placeholder={translate('Search...')}
          onChange={(e) => setQuery(e.target.value)}
          inputClassName="border-0 shadow-none"
          className="border-bottom"
          autoFocus
        />

        {filteredEnvItems.map((option) => {
          return (
            <DropdownItem
              key={option.type + option.value}
              className="d-flex justify-content-between"
              as={option.type === 'link' ? Link : undefined}
              state={option.type === 'link' ? state.name : undefined}
              params={
                option.type === 'link' ? { tab: option.value } : undefined
              }
            >
              {option.type === 'link' ? (
                <>
                  <span>{option.label}</span>
                  <ArrowSquareOutIcon
                    weight="bold"
                    size={20}
                    className="text-muted"
                  />
                </>
              ) : (
                <>
                  <span>
                    <span className="svg-icon svg-icon-2">
                      {option.type === 'environ' ? (
                        <KeyIcon weight="bold" />
                      ) : option.type === 'options' ? (
                        <KeyboardIcon weight="bold" />
                      ) : option.type === 'roles' ? (
                        <UserIcon weight="bold" />
                      ) : (
                        <SlidersIcon weight="bold" />
                      )}
                    </span>
                    <span>{option.label}</span>
                    <span className="text-muted ms-3">
                      {option.type === 'environ'
                        ? 'ENV'
                        : option.type === 'options'
                          ? translate('User input')
                          : option.type === 'roles'
                            ? translate('Role')
                            : option.type === 'resource_options'
                              ? translate('Resource option')
                              : null}
                    </span>
                  </span>
                  <CopyToClipboardButton
                    value={option.label}
                    size={20}
                    onlyButton
                  />
                </>
              )}
            </DropdownItem>
          );
        })}
      </ActionsDropdownComponent>
    </>
  );
};

import { FC, ReactNode } from 'react';

import { Badge, PropertyItem, Tooltip } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { TruncatedMarkdown } from '@/core/TruncatedMarkdown';
import { CompactEditButton } from '@/form/CompactEditButton';
import { translate } from '@/i18n';
import { SecretField } from '@/marketplace/common/SecretField';
import { useUser } from '@/workspace/hooks';

import { ConfigurationEditButton } from './ConfigurationEditButton';
import { CountryListField } from './CountryListField';
import { MultilingualImageEditButton } from './MultilingualImageEditButton';
import { SettingItemDescription } from './types';
import { useHighlightSettingRow } from './useHighlightSettingRow';
import { formatDefaultValue, getKeyTitle, isSettingModified } from './utils';

const ColorField = ({ value }: { value?: string }) => (
  <div
    className="size-[50px] shrink-0 rounded-full inline-block bg-tertiary"
    style={{
      backgroundColor: value,
    }}
  />
);

const ImageField = ({ value }: { value?: string }) => (
  <div
    className="size-[50px] shrink-0 rounded-full bg-center bg-cover bg-no-repeat inline-block bg-tertiary"
    style={{
      backgroundImage: `url(${value})`,
    }}
  />
);

const MultilingualImageField = ({
  value,
}: {
  value?: Record<string, string>;
}) => (
  <div className="flex flex-wrap gap-1.5">
    {value && typeof value === 'object' && Object.keys(value).length > 0 ? (
      Object.entries(value).map(([lang]) => (
        <Badge key={lang} variant="primary" tone="outline">
          {lang.toUpperCase()}
        </Badge>
      ))
    ) : (
      <span className="text-quaternary">
        {translate('No language-specific logos configured')}
      </span>
    )}
  </div>
);

const CountryListEditButton = ({
  onEdit,
  tooltip,
}: {
  onEdit?: () => void;
  tooltip: string;
}) => <CompactEditButton onClick={onEdit} tooltip={tooltip} />;

const LoginPageListField = ({
  itemKey,
  value,
}: {
  itemKey: string;
  value?: any[];
}) => {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return (
      <span className="text-quaternary">{translate('Not configured')}</span>
    );
  }

  if (itemKey === 'LOGIN_PAGE_STATS') {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((stat, i) => (
          <Badge key={i} variant="primary" tone="outline">
            {stat.value} {stat.label}
          </Badge>
        ))}
      </div>
    );
  }

  if (itemKey === 'LOGIN_PAGE_CAROUSEL_SLIDES') {
    return (
      <span className="text-quaternary">
        {translate('{count} slides configured', { count: value.length })}
      </span>
    );
  }

  if (itemKey === 'LOGIN_PAGE_NEWS') {
    return (
      <span className="text-quaternary">
        {translate('{count} news items configured', { count: value.length })}
      </span>
    );
  }

  return <span>{value.length} items</span>;
};

/**
 * Dispatches and renders a setting's value based on its Mastermind setting type.
 */
const renderSettingValue = (
  item: SettingItemDescription,
  value: unknown,
  isLoading?: boolean,
): ReactNode => {
  switch (item.type) {
    case 'secret_field':
      return <SecretField value={value as string} />;

    case 'image_field':
      return <ImageField value={value as string} />;

    case 'color_field':
      return <ColorField value={value as string} />;

    case 'boolean':
      return value === true ? translate('Yes') : translate('No');

    case 'country_list_field':
      return isLoading ? (
        <LoadingSpinner />
      ) : (
        <CountryListField value={value as any} />
      );

    case 'dict_field':
      return (
        <pre className="text-xs m-0 whitespace-pre-wrap">
          {typeof value === 'object' && value !== null
            ? JSON.stringify(value, null, 2)
            : String(value || '')}
        </pre>
      );

    case 'markdown_field':
      return typeof value === 'string' && value.trim() ? (
        <TruncatedMarkdown text={value} title={getKeyTitle(item.key)} />
      ) : (
        <span className="text-quaternary">{translate('Not configured')}</span>
      );

    case 'multilingual_image_field':
      return <MultilingualImageField value={value as Record<string, string>} />;

    case 'json_list_field':
      return <LoginPageListField itemKey={item.key} value={value as any[]} />;

    case 'choice_field':
    case 'select':
      return (
        item.options?.find((option) => option.value === value)?.label ||
        (value as ReactNode)
      );

    case 'multiple_choice_field':
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return null;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((v) => {
              const label =
                item.options?.find((option) => option.value === v)?.label || v;
              return (
                <Badge key={v} variant="primary" tone="outline">
                  {label}
                </Badge>
              );
            })}
          </div>
        );
      }
      return value as ReactNode;

    default:
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value) && value.length === 0) {
          return null;
        }
        return <pre>{JSON.stringify(value, null, 2)}</pre>;
      }
      return value as ReactNode;
  }
};

/**
 * Resolves the appropriate action control for a setting row.
 */
const getSettingAction = ({
  item,
  value,
  canEdit,
  onEdit,
  editDisabledReason,
}: {
  item: SettingItemDescription;
  value: unknown;
  canEdit: boolean;
  onEdit?: () => void;
  editDisabledReason?: string;
}): ReactNode => {
  if (!canEdit) return undefined;

  const title = getKeyTitle(item.key);
  const editLabel = translate('Edit {name}', { name: title });

  switch (item.type) {
    case 'country_list_field':
      return <CountryListEditButton onEdit={onEdit} tooltip={editLabel} />;

    case 'multilingual_image_field':
      return (
        <MultilingualImageEditButton
          item={item}
          value={value as Record<string, string>}
          tooltip={editLabel}
        />
      );

    case 'json_list_field':
      return <CompactEditButton onClick={onEdit} tooltip={editLabel} />;

    default:
      return (
        <ConfigurationEditButton
          item={item}
          value={value}
          tooltip={editLabel}
          disabledReason={editDisabledReason}
        />
      );
  }
};

export interface FieldRowProps {
  item: SettingItemDescription;
  value: unknown;
  onEdit?: () => void;
  isLoading?: boolean;
  /** Set when the value cannot be edited here; shown as the edit button's tooltip. */
  editDisabledReason?: string;
}

/**
 * Displays an individual setting item from `SettingsDescription.ts` inside a `PropertyList`.
 * Includes automatic field type detection, default value diffing, anchor linking, and edit modal triggering.
 */
export const SettingItemRow: FC<FieldRowProps> = ({
  item,
  value,
  onEdit,
  isLoading,
  editDisabledReason,
}) => {
  const canEdit = Boolean(useUser()?.is_staff);
  const isHighlighted = useHighlightSettingRow(item.key, 'setting-');
  const isModified =
    !isLoading && isSettingModified(item, value, { secretsRedacted: !canEdit });
  const title = getKeyTitle(item.key);

  const actions = getSettingAction({
    item,
    value,
    canEdit,
    onEdit,
    editDisabledReason,
  });

  return (
    <PropertyItem
      key={item.key}
      id={`setting-${item.key}`}
      className={isHighlighted ? 'bg-warning-subtle' : undefined}
      label={
        isModified ? (
          <span className="inline-flex items-center gap-2">
            <span>{title}</span>
            <Tooltip
              label={translate('Default: {default}', {
                default: formatDefaultValue(item),
              })}
            >
              <Badge variant="warning" size="sm" tone="outline">
                {translate('Modified')}
              </Badge>
            </Tooltip>
          </span>
        ) : (
          title
        )
      }
      description={item.description}
      descriptionClass="text-tertiary"
      value={renderSettingValue(item, value, isLoading)}
      actions={actions}
    />
  );
};

export const FieldRow = SettingItemRow;

import { Badge } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { TruncatedMarkdown } from '@/core/TruncatedMarkdown';
import { CompactEditButton } from '@/form/CompactEditButton';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { SecretField } from '@/marketplace/common/SecretField';
import { useUser } from '@/workspace/hooks';

import { ConfigurationEditButton } from './ConfigurationEditButton';
import { CountryListField } from './CountryListField';
import { MultilingualImageEditButton } from './MultilingualImageEditButton';
import { getKeyTitle } from './utils';

const ColorField = ({ value }) => (
  <div
    className="size-[50px] shrink-0 rounded-full inline-block bg-tertiary"
    style={{
      backgroundColor: value,
    }}
  />
);

const ImageField = ({ value }) => (
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
  value: Record<string, string>;
}) => (
  <div className="flex flex-wrap gap-2">
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

const CountryListEditButton = ({ onEdit, tooltip }) => (
  <CompactEditButton onClick={onEdit} tooltip={tooltip} />
);

const LoginPageListField = ({
  itemKey,
  value,
}: {
  itemKey: string;
  value: any[];
}) => {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return (
      <span className="text-quaternary">{translate('Not configured')}</span>
    );
  }

  if (itemKey === 'LOGIN_PAGE_STATS') {
    return (
      <div className="flex flex-wrap gap-2">
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

interface FieldRowProps {
  item: any;
  value: any;
  onEdit?: any;
  isLoading?: boolean;
  // Set when the value cannot be edited here; shown as the edit button's tooltip.
  editDisabledReason?: string;
}

export const FieldRow = ({
  item,
  value,
  onEdit,
  isLoading,
  editDisabledReason,
}: FieldRowProps) => {
  const canEdit = Boolean(useUser()?.is_staff);
  const editLabel = translate('Edit {name}', { name: getKeyTitle(item.key) });
  const actions = !canEdit ? undefined : item.type === 'country_list_field' ? (
    <CountryListEditButton onEdit={onEdit} tooltip={editLabel} />
  ) : item.type === 'multilingual_image_field' ? (
    <MultilingualImageEditButton
      item={item}
      value={value}
      tooltip={editLabel}
    />
  ) : item.type === 'json_list_field' ? (
    <CompactEditButton onClick={onEdit} tooltip={editLabel} />
  ) : (
    <ConfigurationEditButton
      item={item}
      value={value}
      tooltip={editLabel}
      disabledReason={editDisabledReason}
    />
  );

  return (
    <FormTable.Item
      key={item.key}
      label={getKeyTitle(item.key)}
      description={item.description}
      descriptionClassName="text-tertiary"
      value={
        item.type === 'secret_field' ? (
          <SecretField value={value} />
        ) : item.type === 'image_field' ? (
          <ImageField value={value} />
        ) : item.type === 'color_field' ? (
          <ColorField value={value} />
        ) : item.type === 'boolean' ? (
          value === true ? (
            translate('Yes')
          ) : (
            translate('No')
          )
        ) : item.type === 'country_list_field' ? (
          isLoading ? (
            <LoadingSpinner />
          ) : (
            <CountryListField value={value} />
          )
        ) : item.type === 'dict_field' ? (
          <pre className="text-xs m-0 whitespace-pre-wrap">
            {typeof value === 'object' && value !== null
              ? JSON.stringify(value, null, 2)
              : value || ''}
          </pre>
        ) : item.type === 'markdown_field' ? (
          value?.trim() ? (
            <TruncatedMarkdown text={value} title={getKeyTitle(item.key)} />
          ) : (
            <span className="text-quaternary">
              {translate('Not configured')}
            </span>
          )
        ) : item.type === 'multilingual_image_field' ? (
          <MultilingualImageField value={value} />
        ) : item.type === 'json_list_field' ? (
          <LoginPageListField itemKey={item.key} value={value} />
        ) : typeof value === 'object' ? (
          <pre>{JSON.stringify(value, null, 2)}</pre>
        ) : (item.type === 'choice_field' || item.type === 'select') &&
          item.options ? (
          item.options.find((option) => option.value === value)?.label || value
        ) : item.type === 'multiple_choice_field' &&
          item.options &&
          Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1">
            {value.map((v) => {
              const label =
                item.options.find((option) => option.value === v)?.label || v;
              return (
                <Badge key={v} variant="primary" tone="outline">
                  {label}
                </Badge>
              );
            })}
          </div>
        ) : (
          value
        )
      }
      actions={actions}
    />
  );
};

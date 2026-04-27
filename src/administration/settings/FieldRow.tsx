import { LoadingSpinner } from '@/core/LoadingSpinner';
import { CompactEditButton } from '@/form/CompactEditButton';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { SecretField } from '@/marketplace/common/SecretField';

import { ConfigurationEditButton } from './ConfigurationEditButton';
import { CountryListField } from './CountryListField';
import { MultilingualImageEditButton } from './MultilingualImageEditButton';
import { getKeyTitle } from './utils';

const ColorField = ({ value }) => (
  <div className="symbol symbol-50px symbol-circle">
    <div
      className="symbol-label"
      style={{
        backgroundColor: value,
      }}
    />
  </div>
);

const ImageField = ({ value }) => (
  <div className="symbol symbol-50px symbol-circle">
    <div
      className="symbol-label"
      style={{
        backgroundImage: `url(${value})`,
      }}
    />
  </div>
);

const MultilingualImageField = ({
  value,
}: {
  value: Record<string, string>;
}) => (
  <div className="d-flex flex-wrap gap-2">
    {value && typeof value === 'object' && Object.keys(value).length > 0 ? (
      Object.entries(value).map(([lang]) => (
        <span key={lang} className="badge badge-light-primary">
          {lang.toUpperCase()}
        </span>
      ))
    ) : (
      <span className="text-muted">
        {translate('No language-specific logos configured')}
      </span>
    )}
  </div>
);

const CountryListEditButton = ({ onEdit }) => (
  <CompactEditButton onClick={onEdit} />
);

const LoginPageListField = ({
  itemKey,
  value,
}: {
  itemKey: string;
  value: any[];
}) => {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return <span className="text-muted">{translate('Not configured')}</span>;
  }

  if (itemKey === 'LOGIN_PAGE_STATS') {
    return (
      <div className="d-flex flex-wrap gap-2">
        {value.map((stat, i) => (
          <span key={i} className="badge badge-light-primary">
            {stat.value} {stat.label}
          </span>
        ))}
      </div>
    );
  }

  if (itemKey === 'LOGIN_PAGE_CAROUSEL_SLIDES') {
    return (
      <span className="text-muted">
        {translate('{count} slides configured', { count: value.length })}
      </span>
    );
  }

  if (itemKey === 'LOGIN_PAGE_NEWS') {
    return (
      <span className="text-muted">
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
}

export const FieldRow = ({ item, value, onEdit, isLoading }: FieldRowProps) => {
  return (
    <FormTable.Item
      key={item.key}
      label={getKeyTitle(item.key)}
      description={item.description}
      descriptionClassName="text-gray-600"
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
          <pre style={{ fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap' }}>
            {typeof value === 'object' && value !== null
              ? JSON.stringify(value, null, 2)
              : value || ''}
          </pre>
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
          <div className="d-flex flex-wrap gap-1">
            {value.map((v) => {
              const label =
                item.options.find((option) => option.value === v)?.label || v;
              return (
                <span key={v} className="badge badge-light-primary">
                  {label}
                </span>
              );
            })}
          </div>
        ) : (
          value
        )
      }
      actions={
        item.type === 'country_list_field' ? (
          <CountryListEditButton onEdit={onEdit} />
        ) : item.type === 'multilingual_image_field' ? (
          <MultilingualImageEditButton item={item} value={value} />
        ) : item.type === 'json_list_field' ? (
          <CompactEditButton onClick={onEdit} />
        ) : (
          <ConfigurationEditButton item={item} value={value} />
        )
      }
    />
  );
};

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { EditButton } from '@waldur/form/EditButton';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

import { ConfigurationEditButton } from './ConfigurationEditButton';
import { CountryListField } from './CountryListField';
import { MultilingualImageEditButton } from './MultilingualImageEditButton';
import { getKeyTitle, SIDEBAR_STYLES } from './utils';

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
  <EditButton onClick={onEdit} size="sm" />
);

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
        item.type === 'image_field' ? (
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
        ) : typeof value === 'object' ? (
          <pre>{JSON.stringify(value, null, 2)}</pre>
        ) : item.key === 'SIDEBAR_STYLE' ? (
          SIDEBAR_STYLES.find((option) => option.value === value)?.label ||
          value
        ) : (
          value
        )
      }
      actions={
        item.type === 'country_list_field' ? (
          <CountryListEditButton onEdit={onEdit} />
        ) : item.type === 'multilingual_image_field' ? (
          <MultilingualImageEditButton item={item} value={value} />
        ) : (
          <ConfigurationEditButton item={item} value={value} />
        )
      }
    />
  );
};

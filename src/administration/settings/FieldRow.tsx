import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { EditButton } from '@waldur/form/EditButton';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

import { ConfigurationEditButton } from './ConfigurationEditButton';
import { CountryListField } from './CountryListField';
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
        ) : typeof value === 'object' ? (
          <pre>{JSON.stringify(value, null, 2)}</pre>
        ) : (
          value
        )
      }
      actions={
        item.type === 'country_list_field' ? (
          <CountryListEditButton onEdit={onEdit} />
        ) : (
          <ConfigurationEditButton item={item} value={value} />
        )
      }
    />
  );
};

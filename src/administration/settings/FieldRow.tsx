import { translate } from '@waldur/i18n';

import { ConfigurationEditButton } from './ConfigurationEditButton';
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
export const FieldRow = ({ item, value }) => {
  return (
    <tr>
      <td className="col-md-4">
        <p className="py-0">
          <strong>{getKeyTitle(item.key)}</strong>
        </p>
        <p className="text-muted py-0 mb-0">{item.description}</p>
      </td>
      <td className="col-md">
        {item.type === 'image_field' ? (
          <ImageField value={value} />
        ) : item.type === 'color_field' ? (
          <ColorField value={value} />
        ) : item.type === 'boolean' ? (
          value === true ? (
            translate('Yes')
          ) : (
            translate('No')
          )
        ) : (
          value
        )}
      </td>
      <td className="col-md-auto col-actions">
        <ConfigurationEditButton item={item} value={value} />
      </td>
    </tr>
  );
};

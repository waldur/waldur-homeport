import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

import { ConfigurationEditButton } from './ConfigurationEditButton';
import { getKeyTitle } from './utils';

const ColorField = ({ item }) => (
  <div className="symbol symbol-50px symbol-circle">
    <div
      className="symbol-label"
      style={{
        backgroundColor: ENV.plugins.WALDUR_CORE[item.key],
      }}
    />
  </div>
);
const ImageField = ({ item }) => (
  <div className="symbol symbol-50px symbol-circle">
    <div
      className="symbol-label"
      style={{
        backgroundImage: `url(${ENV.plugins.WALDUR_CORE[item.key]})`,
      }}
    />
  </div>
);
export const FieldRow = ({ item }) => {
  const value = ENV.plugins.WALDUR_CORE[item.key] || item.default;
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
          <ImageField item={item} />
        ) : item.type === 'color_field' ? (
          <ColorField item={item} />
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
        <ConfigurationEditButton item={item} />
      </td>
    </tr>
  );
};

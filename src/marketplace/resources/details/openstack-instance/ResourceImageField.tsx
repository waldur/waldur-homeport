import { useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { SYSTEM_IMAGES } from '@waldur/marketplace/deploy/utils';
import { Field } from '@waldur/resource/summary';

import './ResourceImageField.scss';

export const getImageInfo = (imageName: string) => {
  if (!imageName) return null;
  const image = SYSTEM_IMAGES.find((item) =>
    imageName.toLowerCase().includes(item.name),
  );
  if (image) {
    // Extract the version from the image name
    /* eslint-disable no-useless-escape */
    const version = imageName
      .replace(new RegExp(`.*${image.name}\D*`, 'gi'), '')
      .trim();

    return {
      label: image.label,
      version: version,
      image: image.thumb,
    };
  } else {
    // Let's extract the version and label of unknown image, the following regex will do that.
    // e.g. "Unknown OS 12.5" => { label: "Unknown OS", version: 12.5 }
    const version = imageName.replace(/^\d*\D*/gi, '').trim();
    const match = imageName.match(/^\d*\D*/gi);
    const label = match.pop().trim();
    return {
      label,
      version,
    };
  }
};

export const ResourceImageField = ({ scope }) => {
  const info = useMemo(() => getImageInfo(scope.image_name), [scope]);
  return (
    <Field
      label={translate('Image')}
      value={
        <div className={'vm-image-field' + (info.image ? ' has-icon' : '')}>
          {info.image && <img src={info.image} />}
          <span>
            {info.label} {info.version}
          </span>
        </div>
      }
    />
  );
};

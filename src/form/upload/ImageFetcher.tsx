import { useState, useEffect } from 'react';

import { get } from '@waldur/core/api';
import { Image } from '@waldur/core/Image';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

export const ImageFetcher = ({ url, name, thumb = false, iconSize = 20 }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      setLoading(true);
      setError(null);

      try {
        const blob = await get<Blob>(url);

        // Convert blob to a URL and set it to state
        const imageUrl = URL.createObjectURL(blob);
        setImageUrl(imageUrl);
      } catch {
        setError(translate('Failed to load image'));
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    // Release resources
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, []);

  return (
    <div className={!thumb && imageUrl ? 'text-center bg-light' : undefined}>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p>{error}</p>
      ) : imageUrl ? (
        thumb ? (
          <Image size={iconSize} src={imageUrl} />
        ) : (
          <img
            src={imageUrl}
            alt={name}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        )
      ) : (
        translate('Failed to load image')
      )}
    </div>
  );
};

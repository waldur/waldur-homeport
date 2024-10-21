import { useState, useEffect } from 'react';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

export const ImageFetcher = ({ url, name }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await get<Blob>(url, { responseType: 'blob' });

        // Convert blob to a URL and set it to state
        const imageBlob = new Blob([response.data]);
        const imageUrl = URL.createObjectURL(imageBlob);

        setImageUrl(imageUrl);
      } catch (err) {
        setError('Failed to load image');
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, []);

  return (
    <div>
      {loading && <LoadingSpinner />}
      {error && <p>{error}</p>}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={name}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      )}
    </div>
  );
};

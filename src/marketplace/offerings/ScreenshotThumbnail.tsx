import * as React from 'react';

import { translate } from '@waldur/i18n';
import { Screenshot } from '@waldur/marketplace/types';

interface ScreenshotThumbnailProps {
  screenshot: Screenshot;
  onClick(): void;
}

export const ScreenshotThumbnail = (props: ScreenshotThumbnailProps) => {
  return (
    <img
      src={props.screenshot.thumbnail}
      alt={translate('Screenshot here')}
      onClick={props.onClick}
      style={{ cursor: 'pointer' }}
    />
  );
};

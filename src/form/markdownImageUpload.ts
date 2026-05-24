import { marketplaceProviderOfferingsUploadMarkdownImage } from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { ENV } from '@/core/config';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';

export const isMarkdownImageDisplayEnabled = (): boolean =>
  isFeatureVisible(MarketplaceFeatures.allow_display_of_images_in_markdown);

export const isMarkdownImageUploadEnabled = (): boolean =>
  isMarkdownImageDisplayEnabled() &&
  Boolean(ENV.plugins.WALDUR_CORE?.ENABLE_MARKDOWN_IMAGE_UPLOAD);

export const uploadOfferingMarkdownImage = async (
  offeringUuid: string,
  image: File,
): Promise<string> => {
  const response = await marketplaceProviderOfferingsUploadMarkdownImage({
    path: { uuid: offeringUuid },
    body: { image: fileSerializer(image) },
    ...formDataOptions,
    throwOnError: true,
  });
  return response.data.url;
};

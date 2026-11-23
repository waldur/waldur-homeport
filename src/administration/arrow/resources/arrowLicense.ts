import type { Resource } from 'waldur-js-client';

/**
 * The Arrow license a resource is billed through; the backend's
 * arrow_license() applies the same rule.
 *
 * The license lives in the arrow_license_reference attribute (resource sync
 * stores the vendor subscription in backend_id). An attribute that is
 * present but empty means no license. Only links made before the attribute
 * existed have the license (XSP...) in backend_id.
 */
export const getArrowLicense = (resource: Resource): string | undefined => {
  const attributes = resource.attributes as Record<string, string> | undefined;
  if (attributes && 'arrow_license_reference' in attributes) {
    return attributes.arrow_license_reference || undefined;
  }
  return resource.backend_id?.toUpperCase().startsWith('XSP')
    ? resource.backend_id
    : undefined;
};

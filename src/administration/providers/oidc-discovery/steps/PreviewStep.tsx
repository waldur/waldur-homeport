import { FC } from 'react';
import { useFormState } from 'react-final-form';

import {
  AlertItem,
  Badge,
  PropertyCard,
  PropertyItem,
  PropertyList,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { WizardModal, WizardStepProps } from '@/wizard';

import type { FieldMappingChoice, OidcFormValues } from '../types';

const buildAttributeMapping = (
  fieldMappings: FieldMappingChoice[],
): Record<string, string> => {
  const mapping: Record<string, string> = {};
  for (const fm of fieldMappings) {
    const claim = fm.isCustom ? fm.customClaim : fm.selectedClaim;
    if (claim) {
      mapping[fm.waldurField] = claim;
    }
  }
  return mapping;
};

export const PreviewStep: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<OidcFormValues>();
  const providerType = props.data?.providerType;
  const existingProvider = props.data?.existingProvider;

  const attributeMapping = buildAttributeMapping(values.fieldMappings);
  const mappedFields = Object.entries(attributeMapping);

  return (
    <WizardModal {...props}>
      <h4 className="mb-3">{translate('Preview Settings')}</h4>
      <p className="text-quaternary mb-3">
        {translate(
          'Review the settings below before saving. These will configure the identity provider.',
        )}
      </p>

      {/* Connection Card */}
      <PropertyCard bordered title={translate('Connection')} className="mb-3">
        <PropertyList variant="summary" termWidth="md">
          <PropertyItem
            label={translate('Provider Type')}
            value={
              <Badge variant="primary" tone="outline">
                {providerType}
              </Badge>
            }
          />
          <PropertyItem
            label={translate('Discovery URL')}
            value={propVal.code(values.discovery_url)}
            valueClass="wrap-anywhere"
            hideIfEmpty={false}
          />
          <PropertyItem
            label={translate('Client ID')}
            value={propVal.code(values.client_id)}
          />
          <PropertyItem
            label={translate('Verify SSL')}
            value={propVal.boolean(values.verify_ssl)}
          />
        </PropertyList>
      </PropertyCard>

      {/* Attribute Mappings Card */}
      <PropertyCard
        bordered
        title={translate('Attribute Mappings')}
        className="mb-3"
      >
        {mappedFields.length > 0 ? (
          <table className="table table-sm table-borderless">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>{translate('Waldur Field')}</th>
                <th>{translate('OIDC Claim')}</th>
              </tr>
            </thead>
            <tbody>
              {mappedFields.map(([field, claim]) => (
                <tr key={field}>
                  <td>
                    <code>{field}</code>
                  </td>
                  <td>
                    <code>{claim}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <span className="text-quaternary">
            {translate('No attribute mappings configured')}
          </span>
        )}
      </PropertyCard>

      {/* Configuration Card */}
      <PropertyCard
        bordered
        title={translate('Configuration')}
        className="mb-3"
      >
        <PropertyList variant="summary" termWidth="md">
          <PropertyItem
            label={translate('Label')}
            value={<strong>{values.label}</strong>}
          />
          <PropertyItem
            label={translate('Extra Scopes')}
            value={propVal.code(values.extra_scope)}
            placeholder="none"
          />
          <PropertyItem
            label={translate('User Field')}
            value={propVal.code(values.user_field || 'username')}
          />
          <PropertyItem
            label={translate('User Claim')}
            value={propVal.code(values.user_claim || 'sub')}
          />
          <PropertyItem
            label={translate('Protected Fields')}
            value={propVal.code(values.protected_fields)}
            placeholder="none"
          />
          <PropertyItem
            label={translate('Management URL')}
            value={propVal.code(values.management_url)}
            placeholder="not-set"
          />
          <PropertyItem
            label={translate('Allowed Redirect URIs')}
            value={
              values.allowed_redirects.length > 0
                ? values.allowed_redirects.map((url) => propVal.code(url))
                : undefined
            }
            placeholder={translate('Any (fallback to HOMEPORT_URL)')}
            copyable
          />
          <PropertyItem
            label={translate('PKCE')}
            value={propVal.boolean(values.enable_pkce, {
              wording: 'enabled',
              display: 'badge',
            })}
          />
          <PropertyItem
            label={translate('Post-Logout Redirect')}
            value={propVal.boolean(values.enable_post_logout_redirect, {
              wording: 'enabled',
              display: 'badge',
            })}
          />
          <PropertyItem
            label={translate('Provider Status')}
            value={propVal.boolean(values.is_active, {
              wording: 'enabled',
              display: 'badge',
              variants: ['success', 'warning'],
            })}
          />
        </PropertyList>
      </PropertyCard>

      <AlertItem
        variant="info"
        type="floating"
        title={
          existingProvider
            ? translate(
                'Click "Update Provider" to apply these changes. Client secret will be securely stored.',
              )
            : translate(
                'Click "Create Provider" to save this configuration. Client secret will be securely stored.',
              )
        }
      />
    </WizardModal>
  );
};

import React from 'react';

import { translate } from '@/i18n';

import { K8sFormSection } from './K8sFormSection';
import K8sSecurityRulesField from './K8sSecurityRulesField';

// Default meta object for security rules fields
const DEFAULT_FIELD_META = {
  touched: false,
  error: undefined,
  warning: undefined,
  autofilled: false,
  asyncValidating: false,
  dirty: false,
  form: 'k8s-config',
  initial: undefined,
  invalid: false,
  pristine: true,
  submitting: false,
  submitFailed: false,
  valid: true,
  visited: false,
};

interface K8sSecurityConfigSectionProps {
  publicAccessRules: any[];
  onPublicAccessRulesChange: (rules: any[]) => void;
  administrativeAccessRules: any[];
  onAdministrativeAccessRulesChange: (rules: any[]) => void;
}

export const K8sSecurityConfigSection: React.FC<
  K8sSecurityConfigSectionProps
> = ({
  publicAccessRules,
  onPublicAccessRulesChange,
  administrativeAccessRules,
  onAdministrativeAccessRulesChange,
}) => {
  return (
    <K8sFormSection
      title={translate('Security configuration')}
      subtitle={translate(
        'Configure network security rules for cluster access and administration',
      )}
      topSeparator
    >
      <K8sSecurityRulesField
        field={{
          label: translate('Public access rules'),
          help_text: translate(
            'Network rules for public-facing load balancers and ingress controllers',
          ),
          required: false,
          rule_type: 'public_access',
        }}
        input={{
          value: publicAccessRules,
          onChange: onPublicAccessRulesChange,
          onBlur: () => {},
          onFocus: () => {},
          onDragStart: () => {},
          onDrop: () => {},
          name: 'public_access_rules',
        }}
        meta={DEFAULT_FIELD_META}
        className="mb-5"
      />

      <K8sSecurityRulesField
        field={{
          label: translate('Administrative access rules'),
          help_text: translate(
            'Network rules for cluster administration and monitoring',
          ),
          required: false,
          rule_type: 'administrative_access',
        }}
        input={{
          value: administrativeAccessRules,
          onChange: onAdministrativeAccessRulesChange as any,
          onBlur: () => {},
          onFocus: () => {},
          onDragStart: () => {},
          onDrop: () => {},
          name: 'administrative_access_rules',
        }}
        meta={DEFAULT_FIELD_META}
      />
    </K8sFormSection>
  );
};

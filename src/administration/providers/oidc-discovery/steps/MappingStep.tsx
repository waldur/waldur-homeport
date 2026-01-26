import { FC, useEffect, useMemo } from 'react';
import { Card, Form } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';
import {
  isProfileAttributeEnabled,
  ProfileAttribute,
} from '@waldur/user/support/profileAttributes';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

import type {
  FieldMappingChoice,
  OidcFormValues,
  WaldurFieldSuggestion,
} from '../types';

const NOT_MAPPED = '__not_mapped__';
const CUSTOM_CLAIM = '__custom__';

interface FieldMappingRowProps {
  field: WaldurFieldSuggestion;
  mapping: FieldMappingChoice | undefined;
  allClaims: string[];
  onChange: (mapping: FieldMappingChoice) => void;
}

const FieldMappingRow: FC<FieldMappingRowProps> = ({
  field,
  mapping,
  allClaims,
  onChange,
}) => {
  const selectedValue = mapping?.isCustom
    ? CUSTOM_CLAIM
    : mapping?.selectedClaim || NOT_MAPPED;

  const handleSelectChange = (value: string) => {
    if (value === NOT_MAPPED) {
      onChange({
        waldurField: field.field,
        selectedClaim: null,
        isCustom: false,
      });
    } else if (value === CUSTOM_CLAIM) {
      onChange({
        waldurField: field.field,
        selectedClaim: null,
        isCustom: true,
        customClaim: mapping?.customClaim || '',
      });
    } else {
      onChange({
        waldurField: field.field,
        selectedClaim: value,
        isCustom: false,
      });
    }
  };

  const handleCustomClaimChange = (customClaim: string) => {
    onChange({
      waldurField: field.field,
      selectedClaim: customClaim || null,
      isCustom: true,
      customClaim,
    });
  };

  const suggestedSet = new Set(field.suggested_claims);
  const availableSet = new Set(field.available_claims);

  return (
    <div className="row mb-4 align-items-start">
      <div className="col-md-4">
        <label className="form-label fw-semibold">{field.field}</label>
        <small className="d-block text-muted">{field.description}</small>
      </div>
      <div className="col-md-8">
        <Form.Select
          value={selectedValue}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="mb-2"
        >
          <option value={NOT_MAPPED}>-- {translate('Not mapped')} --</option>

          {field.available_claims.length > 0 && (
            <optgroup label={translate('Available Claims')}>
              {field.available_claims.map((claim) => (
                <option key={claim} value={claim}>
                  {claim}
                  {suggestedSet.has(claim) ? ' (Suggested)' : ''}
                </option>
              ))}
            </optgroup>
          )}

          {allClaims.filter((c) => !availableSet.has(c)).length > 0 && (
            <optgroup label={translate('Other Claims')}>
              {allClaims
                .filter((c) => !availableSet.has(c))
                .map((claim) => (
                  <option key={claim} value={claim}>
                    {claim}
                  </option>
                ))}
            </optgroup>
          )}

          <option value={CUSTOM_CLAIM}>
            -- {translate('Custom claim')} --
          </option>
        </Form.Select>

        {mapping?.isCustom && (
          <Form.Control
            type="text"
            value={mapping.customClaim || ''}
            onChange={(e) => handleCustomClaimChange(e.target.value)}
            placeholder={translate('Enter custom claim name')}
          />
        )}

        {field.suggested_claims.length > 0 && (
          <div className="mt-1">
            <small className="text-muted">
              {translate('Suggested:')}
              {field.suggested_claims.map((claim) => (
                <Badge
                  key={claim}
                  variant={availableSet.has(claim) ? 'success' : 'default'}
                  outline
                  className="ms-1"
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    handleSelectChange(
                      availableSet.has(claim) ? claim : CUSTOM_CLAIM,
                    )
                  }
                >
                  {claim}
                </Badge>
              ))}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export const MappingStep: FC<WizardStepProps> = (props) => {
  const form = useForm<OidcFormValues>();
  const { values } = useFormState<OidcFormValues>();
  const existingProvider = props.data?.existingProvider;

  // Filter fields to only show enabled profile attributes
  const enabledFields = useMemo(() => {
    if (!values.discoveryResult?.waldur_fields) {
      return [];
    }
    return values.discoveryResult.waldur_fields.filter((field) =>
      isProfileAttributeEnabled(field.field as ProfileAttribute),
    );
  }, [values.discoveryResult?.waldur_fields]);

  // Combine discovered claims with manual claims
  const allClaims = useMemo(() => {
    const claims = [
      ...(values.discoveryResult?.claims_supported || []),
      ...(values.manualClaims || []),
    ];
    return [...new Set(claims)];
  }, [values.discoveryResult?.claims_supported, values.manualClaims]);

  // Initialize mappings from existing provider or auto-select first available claim
  useEffect(() => {
    if (values.fieldMappings.length === 0 && enabledFields.length > 0) {
      const initialMappings: FieldMappingChoice[] = enabledFields.map(
        (field) => {
          // Check if there's an existing mapping from the provider
          const existingMapping =
            existingProvider?.attribute_mapping?.[field.field];

          if (existingMapping) {
            const isAvailable =
              allClaims.includes(existingMapping) ||
              field.available_claims.includes(existingMapping);
            return {
              waldurField: field.field,
              selectedClaim: existingMapping,
              isCustom: !isAvailable,
              customClaim: !isAvailable ? existingMapping : undefined,
            };
          }

          // Auto-select first available claim
          if (field.available_claims.length > 0) {
            return {
              waldurField: field.field,
              selectedClaim: field.available_claims[0],
              isCustom: false,
            };
          }

          return {
            waldurField: field.field,
            selectedClaim: null,
            isCustom: false,
          };
        },
      );

      form.change('fieldMappings', initialMappings);
    }
  }, [
    enabledFields,
    allClaims,
    existingProvider,
    values.fieldMappings.length,
    form,
  ]);

  const handleMappingChange = (mapping: FieldMappingChoice) => {
    const newMappings = values.fieldMappings.filter(
      (m) => m.waldurField !== mapping.waldurField,
    );
    newMappings.push(mapping);
    form.change('fieldMappings', newMappings);
  };

  const getMappingForField = (
    fieldName: string,
  ): FieldMappingChoice | undefined => {
    return values.fieldMappings.find((m) => m.waldurField === fieldName);
  };

  const mappedCount = values.fieldMappings.filter(
    (m) => m.selectedClaim || (m.isCustom && m.customClaim),
  ).length;

  return (
    <WizardModal {...props}>
      <h4 className="mb-4">{translate('Claim Mapping')}</h4>
      <p className="text-muted mb-4">
        {translate(
          'Map OIDC claims from your identity provider to Waldur user profile fields. Only enabled profile attributes are shown.',
        )}
      </p>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <Badge variant="primary" outline>
          {translate('{count} of {total} fields mapped', {
            count: mappedCount,
            total: enabledFields.length,
          })}
        </Badge>
      </div>

      <Card className="mb-4">
        <Card.Body>
          {enabledFields.length === 0 ? (
            <p className="text-muted mb-0">
              {translate(
                'No mappable user fields are enabled. Check your profile attribute settings.',
              )}
            </p>
          ) : (
            enabledFields.map((field) => (
              <FieldMappingRow
                key={field.field}
                field={field}
                mapping={getMappingForField(field.field)}
                allClaims={allClaims}
                onChange={handleMappingChange}
              />
            ))
          )}
        </Card.Body>
      </Card>
    </WizardModal>
  );
};

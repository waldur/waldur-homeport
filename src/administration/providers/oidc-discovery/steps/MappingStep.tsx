import { useMemo, useEffect } from 'react';
import { Card, Form } from 'react-bootstrap';

import { Badge } from '@waldur/core/Badge';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';
import {
  isProfileAttributeEnabled,
  ProfileAttribute,
} from '@waldur/user/support/profileAttributes';

import type {
  FieldMappingChoice,
  StepProps,
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

const FieldMappingRow = ({
  field,
  mapping,
  allClaims,
  onChange,
}: FieldMappingRowProps) => {
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

  // Build options with suggested claims at the top
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

          {/* Available claims with suggestions marked */}
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

          {/* Other claims from the IdP */}
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

export const MappingStep = ({
  state,
  updateState,
  onNext,
  onBack,
  onCancel,
}: StepProps) => {
  // Filter fields to only show enabled profile attributes
  const enabledFields = useMemo(() => {
    if (!state.discoveryResult?.waldur_fields) {
      return [];
    }
    return state.discoveryResult.waldur_fields.filter((field) =>
      isProfileAttributeEnabled(field.field as ProfileAttribute),
    );
  }, [state.discoveryResult?.waldur_fields]);

  // Combine discovered claims with manual claims
  const allClaims = useMemo(() => {
    const claims = [
      ...(state.discoveryResult?.claims_supported || []),
      ...(state.manualClaims || []),
    ];
    return [...new Set(claims)];
  }, [state.discoveryResult?.claims_supported, state.manualClaims]);

  // Initialize mappings from existing provider or auto-select first available claim
  useEffect(() => {
    if (state.fieldMappings.length === 0 && enabledFields.length > 0) {
      const initialMappings: FieldMappingChoice[] = enabledFields.map(
        (field) => {
          // Check if there's an existing mapping from the provider
          const existingMapping =
            state.existingProvider?.attribute_mapping?.[field.field];

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

      updateState({ fieldMappings: initialMappings });
    }
  }, [
    enabledFields,
    allClaims,
    state.existingProvider,
    state.fieldMappings.length,
    updateState,
  ]);

  const handleMappingChange = (mapping: FieldMappingChoice) => {
    const newMappings = state.fieldMappings.filter(
      (m) => m.waldurField !== mapping.waldurField,
    );
    newMappings.push(mapping);
    updateState({ fieldMappings: newMappings });
  };

  const getMappingForField = (
    fieldName: string,
  ): FieldMappingChoice | undefined => {
    return state.fieldMappings.find((m) => m.waldurField === fieldName);
  };

  const mappedCount = state.fieldMappings.filter(
    (m) => m.selectedClaim || (m.isCustom && m.customClaim),
  ).length;

  return (
    <div>
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

      <div className="d-flex justify-content-end gap-2 mt-6">
        <ActionButton
          action={onCancel}
          variant="secondary"
          title={translate('Cancel')}
        />
        <ActionButton
          action={onBack}
          variant="tertiary"
          title={translate('Back')}
        />
        <SubmitButton
          submitting={false}
          onClick={onNext}
          label={translate('Continue to Configuration')}
          type="button"
        />
      </div>
    </div>
  );
};

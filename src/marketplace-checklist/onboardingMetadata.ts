import { ChecklistQuestionForm } from './types';

// The metadata holds only these two mappings, so clearing both means the
// question maps to nothing: the row is removed rather than left empty.
export const shouldRemoveOnboardingMetadata = (
  formData: Pick<
    ChecklistQuestionForm,
    'maps_to_customer_field' | 'intent_field'
  >,
  metadataUuid: string | undefined,
): boolean =>
  Boolean(metadataUuid) &&
  !formData.maps_to_customer_field?.trim() &&
  !formData.intent_field?.trim();

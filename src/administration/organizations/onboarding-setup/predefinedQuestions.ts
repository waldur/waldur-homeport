import { translate } from '@waldur/i18n';

export interface PredefinedQuestion {
  uuid?: string; // Present when editing existing question
  description: string;
  user_guidance?: string;
  question_type: string;
  required: boolean;
  order: number;
  options?: string[];
  min_value?: number;
  max_value?: number;
  maps_to_customer_field?: string;
  intent_field?: string;
  metadata_uuid?: string; // UUID of the onboarding metadata (for updates)
  question_options?: Array<{
    uuid: string;
    label: string;
    order: number;
  }>;
}

export const CUSTOMER_CHECKLIST_QUESTIONS: PredefinedQuestion[] = [
  {
    description: translate('Address'),
    user_guidance: translate('Enter your organization address'),
    question_type: 'text_input',
    required: false,
    order: 0,
    maps_to_customer_field: 'address',
  },
  {
    description: translate('Contact email'),
    user_guidance: translate('Enter your contact email address'),
    question_type: 'email',
    required: true,
    order: 1,
    maps_to_customer_field: 'email',
  },
  {
    description: translate('VAT code'),
    user_guidance: translate('Enter your VAT registration number'),
    question_type: 'text_input',
    required: false,
    order: 2,
    maps_to_customer_field: 'vat_code',
  },
];

export const INTENT_CHECKLIST_QUESTIONS: PredefinedQuestion[] = [
  {
    description: translate('Services you plan to use'),
    user_guidance: translate(
      'Which services are you interested in using? (Please select from the available service types.)',
    ),
    question_type: 'multi_select',
    required: true,
    order: 0,
    options: [], // Will be populated dynamically from category groups
    intent_field: 'services',
  },
  {
    description: translate('Organization description'),
    user_guidance: translate(
      'Briefly describe your organization and its main activities or areas of work.',
    ),
    question_type: 'text_area',
    required: true,
    order: 1,
    intent_field: 'description',
  },
  {
    description: translate('Your goals and intended outcomes'),
    user_guidance: translate(
      'What do you want to achieve by using Waldur? Please describe your main objectives or expected outcomes.',
    ),
    question_type: 'text_area',
    required: false,
    order: 2,
    intent_field: 'goals',
  },
];

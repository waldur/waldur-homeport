import { useQuery } from '@tanstack/react-query';
import { Field } from 'react-final-form';
import { proposalPublicCallsRetrieve } from 'waldur-js-client';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { ENV } from '@waldur/core/config';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { SelectField, StringField, TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { VStepperFormStepProps } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { OECD_FOS_2007_CODES } from '@waldur/project/OECD_FOS_2007_CODES';
import { Call, ProposalReview } from '@waldur/proposals/types';

import { FieldReviewComments } from '../create-review/FieldReviewComments';

import { UploadDocumentationFiles } from './UploadDocumentationFiles';

const isCodeRequired = ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY;

export const ProjectDetailsStep = (props: VStepperFormStepProps) => {
  const reviews: ProposalReview[] = props.params?.reviews;
  const proposal = props.params?.proposal;

  const { data: call } = useQuery({
    queryKey: ['Call', proposal.call_uuid],

    queryFn: () =>
      proposalPublicCallsRetrieve({
        path: { uuid: proposal.call_uuid },
        query: { field: ['fixed_duration_in_days'] },
      }).then(
        (response) => response.data as Pick<Call, 'fixed_duration_in_days'>,
      ),

    refetchOnWindowFocus: false,
  });

  // Check if proposal has compliance - collapse panels only if compliance exists
  const hasCompliance = !!proposal?.compliance_status;

  return (
    <AccordionCard
      title={translate('Project details')}
      subtitle={translate('Basic information about your research project.')}
      id={props.id}
      defaultOpen={!hasCompliance}
    >
      <FormGroup label={translate('Name')} required>
        <Field
          name="name"
          component={StringField as any}
          placeholder={translate('Enter a name...')}
        />
      </FormGroup>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_title"
      />

      <FormGroup label={translate('Summary')} required>
        <Field
          name="project_summary"
          component={TextField as any}
          placeholder={translate('Enter a summary...')}
          maxLength={1000}
        />
      </FormGroup>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_summary"
      />

      <FormGroup label={translate('Description')}>
        <Field
          name="description"
          component={TextField as any}
          placeholder={translate('Enter a description...')}
          maxLength={1000}
        />
      </FormGroup>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_description"
      />

      <FormGroup>
        <Field
          name="project_has_civilian_purpose"
          component={AwesomeCheckboxField as any}
          label={translate('Project for civilian purpose?')}
          size="sm"
        />
      </FormGroup>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_has_civilian_purpose"
      />

      {isFeatureVisible(ProjectFeatures.oecd_fos_2007_code) ? (
        <FormGroup
          label={translate('Research field (OECD code)')}
          required={isCodeRequired}
        >
          <Field
            name="oecd_fos_2007_code"
            component={SelectField as any}
            options={OECD_FOS_2007_CODES}
            getOptionValue={(option) => option.value}
            getOptionLabel={(option) => `${option.value}. ${option.label}`}
            isClearable={true}
            simpleValue
          />
        </FormGroup>
      ) : null}
      <FormGroup>
        <Field
          name="project_is_confidential"
          component={AwesomeCheckboxField as any}
          label={translate('Is the project confidential?')}
          size="sm"
        />
      </FormGroup>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_is_confidential"
      />

      <FormGroup label={translate('Project duration in days')} required>
        <Field
          name="duration_in_days"
          component={StringField as any}
          placeholder={translate('Enter number of days...')}
          disabled={!!call?.fixed_duration_in_days}
        />
      </FormGroup>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_duration"
      />

      <FormGroup label={translate('Upload supporting documentation')}>
        <Field
          name="supporting_documentation"
          render={({ input, meta }) => (
            <UploadDocumentationFiles
              input={input}
              meta={meta}
              proposal={props.params.proposal}
            />
          )}
        />
      </FormGroup>
      <FieldReviewComments
        reviews={reviews}
        fieldName="comment_project_supporting_documentation"
      />
    </AccordionCard>
  );
};

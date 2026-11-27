import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';
import {
  marketplaceOfferingTemplatesList,
  OfferingTemplate,
} from 'waldur-js-client';

import { EmptyState, RadioGroup } from 'waldur-ui';
import { WizardModal, WizardStepProps } from 'waldur-wizard';

import { OfferingTemplateFindingsBadges } from '@/administration/offering-templates/OfferingTemplateFindings';
import { getAllPages } from '@/core/api';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { translate } from '@/i18n';
import { SITE_AGENT_PLUGIN } from '@/site-agent/constants';

import { CreateFromTemplateFormData } from './types';
import { getTemplateValues } from './utils';

export const PUBLISHED_TEMPLATES_QUERY = {
  is_published: true,
  offering_type: SITE_AGENT_PLUGIN,
};

export const TemplateStep: FC<WizardStepProps> = (props) => {
  const form = useForm<CreateFromTemplateFormData>();
  const { values } = useFormState<CreateFromTemplateFormData>();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['offering-templates-published', PUBLISHED_TEMPLATES_QUERY],
    queryFn: () =>
      getAllPages((page) =>
        marketplaceOfferingTemplatesList({
          query: { ...PUBLISHED_TEMPLATES_QUERY, o: ['name'], page },
        }),
      ),
    refetchOnWindowFocus: false,
  });

  // A different template brings its own parameters and roles: what was
  // entered for the previous one does not carry over.
  const pick = (uuid: string) => {
    const template = data?.find((item) => item.uuid === uuid);
    if (!template || template.uuid === values.template?.uuid) {
      return;
    }
    form.batch(() => {
      form.change('template', template);
      const next = getTemplateValues(template);
      form.change('parameters', next.parameters);
      form.change('agent_roles', next.agent_roles);
      form.change('custom_backends', next.custom_backends);
    });
  };

  return (
    <WizardModal
      {...props}
      submitDisabled={!values.template}
      submitTooltip={
        values.template ? undefined : translate('Choose a template first.')
      }
    >
      {/* Registers the requirement, so Next stays off until one is picked. */}
      <Field<OfferingTemplate>
        name="template"
        validate={required}
        render={() => null}
      />
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to load offering templates.')}
          loadData={refetch}
        />
      ) : !data?.length ? (
        <EmptyState
          title={translate('No offering templates')}
          message={translate(
            'Staff publish offering templates under Administration → Offerings → Offering templates.',
          )}
        />
      ) : (
        <RadioGroup
          aria-label={translate('Offering template')}
          value={values.template?.uuid}
          onValueChange={pick}
          options={data.map((template) => ({
            value: template.uuid,
            label: (
              <span
                className="inline-flex gap-2 items-center flex-wrap"
                data-testid="template-option"
              >
                {template.name}
                <span className="text-tertiary text-sm">
                  {translate('version {version}', {
                    version: template.version,
                  })}
                </span>
                <OfferingTemplateFindingsBadges row={template} />
              </span>
            ),
            description: template.description || undefined,
          }))}
        />
      )}
    </WizardModal>
  );
};

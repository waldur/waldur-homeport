import { ArrowLeftIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';
import {
  MaintenanceAnnouncementTemplate,
  MaintenanceAnnouncementTemplateRequest,
  maintenanceAnnouncementsTemplateCreate,
  maintenanceAnnouncementsTemplateList,
  maintenanceAnnouncementsTemplateUpdate,
  maintenanceAnnouncementTemplateOfferingsCreate,
  maintenanceAnnouncementTemplateOfferingsDestroy,
  maintenanceAnnouncementTemplateOfferingsList,
  maintenanceAnnouncementTemplateOfferingsPartialUpdate,
  ServiceProvider,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinnerSimple } from '@waldur/core/LoadingSpinner';
import { getUUID } from '@waldur/core/utils';
import { required } from '@waldur/core/validators';
import {
  FormContainer,
  SelectField,
  StringField,
  SubmitButton,
} from '@waldur/form';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import { MaintenanceForm, MaintenanceFormDialogProps } from '../types';
import {
  getMaintenanceOfferings,
  MAINTENANCE_ANNOUNCEMENT_FORM_ID,
} from '../utils';

interface IForm {
  name?: string;
  template?: MaintenanceAnnouncementTemplate;
}

interface OwnProps {
  resolve: {
    formComponent: FC<MaintenanceFormDialogProps>;
    data: MaintenanceForm;
    provider?: ServiceProvider;
    maintenanceUuid?: string;
    onSave(template: MaintenanceAnnouncementTemplate): void;
    refetch?(): void;
  };
}

export const MaintenanceSaveAsTemplateDialog = reduxForm<IForm, OwnProps>({
  form: 'MaintenanceSaveAsTemplate',
})(({ submitting, handleSubmit, resolve, invalid, form, change }) => {
  const formValues = useSelector<{}, IForm>(getFormValues(form));
  const dispatch = useDispatch();

  const {
    data: templates,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['MaintenanceTemplates', resolve.provider?.uuid],
    queryFn: () =>
      getAllPages((page) =>
        maintenanceAnnouncementsTemplateList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            service_provider_uuid: resolve.provider?.uuid,
          },
        }),
      ),
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch template offerings when a template is selected (for edit template)
  const {
    data: templateOfferings,
    isLoading: isLoadingOfferings,
    error: errorOfferings,
    refetch: refetchOfferings,
  } = useQuery({
    queryKey: ['MaintenanceTemplateOfferings', formValues?.template?.uuid],
    queryFn: () =>
      !formValues?.template?.uuid
        ? null
        : getAllPages((page) =>
            maintenanceAnnouncementTemplateOfferingsList({
              query: {
                page,
                page_size: MAX_PAGE_SIZE,
                maintenance_template_uuid: formValues.template.uuid,
              },
            }),
          ),
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const backToMainForm = () =>
    dispatch(
      openModalDialog(resolve.formComponent, {
        resolve: {
          provider: resolve.provider,
          refetch: resolve.refetch,
          maintenanceUuid: resolve.maintenanceUuid,
        },
        size: 'lg',
        formId: MAINTENANCE_ANNOUNCEMENT_FORM_ID,
        initialValues: resolve.data,
      }),
    );

  const callback = useCallback(
    async (formData: IForm) => {
      try {
        let template;
        const body: MaintenanceAnnouncementTemplateRequest = {
          name: formData.name,
          service_provider: resolve.provider.url,
          maintenance_type: resolve.data.maintenance_type,
          message: resolve.data.message,
        };
        if (formData.template) {
          // Update
          template = await maintenanceAnnouncementsTemplateUpdate({
            path: { uuid: formData.template.uuid },
            body,
          }).then((res) => res.data);
        } else {
          // Create
          template = await maintenanceAnnouncementsTemplateCreate({
            body,
          }).then((res) => res.data);
        }

        // Use offerings if step2 is loaded otherwise use affected_offerings (from edit mode) for creating a new template
        // Or compare with template-offerings of the selected template
        const {
          offerings = [],
          affected_offerings = [],
          template_affected_offerings = [],
          template: selectedTemplate, // Selected template from the maintenance form
          impact_description,
          impact_level,
        } = resolve.data;

        const allSelectedOfferings = offerings?.length
          ? offerings
          : selectedTemplate && template_affected_offerings?.length
            ? template_affected_offerings.map((item) => ({
                uuid: getUUID(item.offering),
                url: item.offering,
                name: item.offering_name,
              }))
            : affected_offerings?.length
              ? affected_offerings.map((item) => ({
                  uuid: getUUID(item.offering),
                  url: item.offering,
                  name: item.offering_name,
                }))
              : [];

        const {
          newOfferings,
          updatedAffectedOfferings,
          removedAffectedOfferings,
        } = getMaintenanceOfferings({
          offerings: allSelectedOfferings,
          affected_offerings: templateOfferings as any,
          impact_description,
          impact_level,
        });

        const promisesNew = newOfferings.map((offering) => {
          return maintenanceAnnouncementTemplateOfferingsCreate({
            body: {
              maintenance_template: template.url,
              offering: offering.url,
              impact_description: impact_description?.[offering.uuid],
              impact_level: impact_level[offering.uuid],
            },
          });
        });
        const promisesUpdate = updatedAffectedOfferings.map((item) => {
          const offeringUuid = getUUID(item.offering);
          return maintenanceAnnouncementTemplateOfferingsPartialUpdate({
            path: { uuid: item.uuid },
            body: {
              impact_description: impact_description?.[offeringUuid],
              impact_level: impact_level[offeringUuid],
            },
          });
        });
        const promisesRemove = removedAffectedOfferings.map((item) => {
          return maintenanceAnnouncementTemplateOfferingsDestroy({
            path: { uuid: item.uuid },
          });
        });

        await Promise.all(promisesRemove);
        await Promise.all(promisesUpdate);
        await Promise.all(promisesNew);

        refetchOfferings();
        resolve.onSave(template);
        dispatch(
          showSuccess(translate('Maintenance has been save as a template.')),
        );
        backToMainForm();
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Unable to save a maintenance as a template.'),
          ),
        );
      }
    },
    [dispatch, resolve, templateOfferings],
  );

  return (
    <ModalDialog
      title={
        formValues?.template
          ? translate('Update maintenance template')
          : translate('Create a maintenance template')
      }
    >
      <form onSubmit={handleSubmit(callback)}>
        <FormContainer submitting={submitting}>
          {!isLoading && error ? (
            <LoadingErred
              loadData={refetch}
              message={translate('Unable to load templates')}
            />
          ) : null}
          <SelectField
            name="template"
            label={translate('Template')}
            description={translate(
              'Select a previously saved template to update form fields',
            )}
            placeholder={translate('Select or leave it empty')}
            options={templates}
            isClearable
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.uuid}
            isLoading={isLoading}
            onChange={(value) => {
              if (value) {
                change('name', value.name);
              } else {
                change('name', null);
              }
            }}
          />

          {!isLoadingOfferings && errorOfferings ? (
            <LoadingErred
              loadData={refetchOfferings}
              message={translate('Unable to load template offerings')}
            />
          ) : null}

          <StringField
            name="name"
            label={translate('Name')}
            placeholder={
              formValues?.template
                ? translate('Enter a name for the selected template')
                : translate('Enter a name to save as a new template')
            }
            description={
              formValues?.template
                ? translate('Edit name for the selected template')
                : undefined
            }
            maxLength={150}
            required
            validate={required}
          />

          <div className="d-flex justify-content-between">
            <ActionButton
              action={backToMainForm}
              title={translate('Back')}
              iconNode={<ArrowLeftIcon weight="bold" />}
              variant="tertiary"
              className="min-w-125px"
            />
            <SubmitButton
              submitting={submitting}
              disabled={
                invalid || isLoadingOfferings || Boolean(errorOfferings)
              }
              label={translate('Save')}
              className="btn btn-primary min-w-125px"
              children={
                isLoadingOfferings ? (
                  <span className="svg-icon svg-icon-2">
                    {}
                    <LoadingSpinnerSimple />
                  </span>
                ) : null
              }
            />
          </div>
        </FormContainer>
      </form>
    </ModalDialog>
  );
});

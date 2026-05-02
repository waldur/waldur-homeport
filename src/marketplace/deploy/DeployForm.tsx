import { useRouter } from '@uirouter/react';
import { FC, PropsWithChildren } from 'react';
import { SubmissionError } from 'redux-form';
import {
  marketplaceOrdersCreate,
  marketplaceOrdersUpdateAttachment,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { formatOrderForCreate } from '../details/utils';
import { scrollToSectionById } from '../offerings/utils';

export const DeployForm: FC<
  PropsWithChildren<{ offering: PublicOfferingDetails; handleSubmit }>
> = ({ offering, handleSubmit, children }) => {
  const { confirm } = useModal();

  const { showErrorResponse, showSuccess } = useNotify();

  const router = useRouter();
  const mutate = async (values) => {
    await confirm(
      translate('Confirmation'),
      translate('Are you sure you want to submit the order?'),
    );
    try {
      const order = await marketplaceOrdersCreate({
        body: formatOrderForCreate({
          offering,
          formData: values,
        }),
      });
      if (values.attachment instanceof File) {
        await marketplaceOrdersUpdateAttachment({
          path: { uuid: order.data.uuid },
          body: {
            attachment: fileSerializer(values.attachment),
          },
          ...formDataOptions,
        });
      }
      showSuccess(translate('Order has been submitted.'));
      router.stateService.go('marketplace-resource-details', {
        resource_uuid: order.data.marketplace_resource_uuid,
      });
    } catch (error) {
      const errorMessage = translate('Unable to submit order.');
      showErrorResponse(error, errorMessage);
      const errorData = {} as any;
      const _errorData = error?.response?.data;
      if (_errorData && typeof _errorData === 'object') {
        for (const key of Object.keys(_errorData)) {
          if (key === 'non_field_errors') {
            Object.assign(errorData, { plan_entries: _errorData[key] });
            // Scroll to plan step
            scrollToSectionById('step-plan');
          } else {
            Object.assign(errorData, { [key]: _errorData[key] });
          }
        }
      }
      throw new SubmissionError({
        _error: errorMessage,
        ...errorData,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(mutate)} noValidate>
      {children}
    </form>
  );
};

import { FC } from 'react';
import { FieldRenderProps } from 'react-final-form';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { FormTableItemProps } from '@/form/FormTable';

export interface ScriptEditorProps {
  offering: ProviderOfferingDetails;
  type: string;
  dry_run: string;
  label: string;
  refetch: () => Promise<any>;
}

export interface EditOfferingProps extends Partial<
  Omit<FormTableItemProps, 'actions'>
> {
  title?: string;
  scope: any;
  name: string;
  callback(formData): Promise<any>;
  fieldComponent: FC<FieldRenderProps<any>>;
  hideLabel?: boolean;
  fieldProps?: Record<string, any>;
}

export interface OfferingEditPanelProps {
  offering: ProviderOfferingDetails;
  refetch(): Promise<any>;
  loading?: boolean;
}

export interface OfferingEditPanelFormProps {
  offering: ProviderOfferingDetails;
  callback(formData): Promise<any>;
  title?: string;
}

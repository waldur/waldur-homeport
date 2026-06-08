import { ProviderOfferingDetails } from 'waldur-js-client';

export interface ScriptEditorProps {
  offering: ProviderOfferingDetails;
  type: string;
  dry_run: string;
  label: string;
  refetch: () => Promise<any>;
}

export interface OfferingEditPanelProps {
  offering: ProviderOfferingDetails;
  refetch(): Promise<any>;
  loading?: boolean;
}

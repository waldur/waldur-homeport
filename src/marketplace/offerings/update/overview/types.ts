export interface Attribute {
  key: string;
  title: string;
  type: string;
  maxLength?: number;
  required?: boolean;
}
export interface EditOfferingProps {
  offering;
  refetch;
  attribute: Attribute;
  disabled?: boolean;
}

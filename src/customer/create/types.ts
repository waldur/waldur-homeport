export interface CustomerCreateFormData {
  name: string;
  native_name: string;
  domain: string;
  email: string;
  phone_number: string;
  registration_code: string;
  country: { value; display_name };
  address: string;
  vat_code: string;
  postal: string;
  bank_name: string;
  bank_account: string;
}

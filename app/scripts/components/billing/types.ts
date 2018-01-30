export type PhoneNumber = string | {
  national_number: string;
  country_code: string;
};

export interface Customer {
  name: string;
  email: string;
  address?: string;
  country?: string;
  postal?: string;
  phone_number?: PhoneNumber;
  bank_name?: string;
  bank_account?: string;
  vat_code?: string;
}

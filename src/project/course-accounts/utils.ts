import { email } from '@/core/validators';

export interface RawCourseAccount {
  email: string;
  description?: string;
}

export const validateCourseAccountCreation = (record: RawCourseAccount) => {
  const hasDescription = Boolean(record.description);
  const validEmail = !email(record.email);
  return {
    valid: hasDescription && validEmail,
    errors: [
      hasDescription ? null : 'description',
      validEmail ? null : 'invalid_email',
    ].filter(Boolean),
  };
};

export const hasCourseAccountsErrors = (data: RawCourseAccount[]) => {
  if (!data?.length) return true;
  for (let i = 0; i < data.length; i++) {
    const validate = validateCourseAccountCreation(data[i]);
    if (!validate.valid) return true;
  }
  return false;
};

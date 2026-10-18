import { useState } from 'react';
import { translate } from 'waldur-i18n-runtime';
import {
  Card,
  CardContent,
  CardHeader,
  FormField,
  FormLabel,
  FormText,
  Input,
  InputGroup,
  NativeSelect,
  NumberInput,
  SecretInput,
  Textarea,
} from 'waldur-ui';

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/**
 * waldur-ui's Input and Textarea outside waldur-homeport: no Bootstrap, no
 * Metronic, a 16px root. They must look exactly as they do in the app, so
 * every state is on show -- the email field turns invalid once it has been
 * left with a bad address.
 */
export const BillingContactCard = () => {
  const [email, setEmail] = useState('billing@');
  const [touched, setTouched] = useState(false);
  const [term, setTerm] = useState<number | string>(30);
  const emailInvalid = touched && !isEmail(email);

  return (
    <Card>
      <CardHeader className="p-4 pb-0 text-sm font-semibold">
        {translate('Billing contact')}
      </CardHeader>
      <CardContent className="grid gap-4 p-4 md:grid-cols-2">
        <FormField>
          <FormLabel>{translate('Name')}</FormLabel>
          <Input placeholder={translate('Jane Doe')} />
        </FormField>
        <FormField>
          <FormLabel>{translate('Email')}</FormLabel>
          <InputGroup invalid={emailInvalid}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              invalid={emailInvalid}
              aria-describedby={
                emailInvalid ? 'billing-email-error' : undefined
              }
            />
          </InputGroup>
          {emailInvalid && (
            <FormText id="billing-email-error" as="div" variant="danger">
              {translate('Enter a valid email address.')}
            </FormText>
          )}
        </FormField>
        <FormField>
          <FormLabel>{translate('VAT code')}</FormLabel>
          <Input value="EE100000000" disabled readOnly />
        </FormField>
        <FormField>
          <FormLabel>{translate('Payment term')}</FormLabel>
          <NumberInput
            solid
            value={term}
            onValueChange={setTerm}
            min={1}
            max={90}
            unit={translate('days')}
          />
        </FormField>
        <FormField>
          <FormLabel>{translate('Currency')}</FormLabel>
          <NativeSelect defaultValue="EUR">
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </NativeSelect>
        </FormField>
        <FormField className="md:col-span-2">
          <FormLabel>{translate('Invoice API token')}</FormLabel>
          <SecretInput defaultValue="tok_live_example" readOnly />
        </FormField>
        <FormField className="md:col-span-2">
          <FormLabel>{translate('Notes')}</FormLabel>
          <Textarea
            rows={3}
            placeholder={translate('Anything finance should know')}
          />
        </FormField>
      </CardContent>
    </Card>
  );
};

export const getCreditInitialValues = (row) => ({
  value: row.value,
  end_date: row.end_date,
  minimal_consumption_logic: row.minimal_consumption_logic,
  expected_consumption: row.expected_consumption,
  grace_coefficient: row.grace_coefficient,
  apply_as_minimal_consumption: row.apply_as_minimal_consumption,
});

/**
 * A balance after a dialog's amount is applied, for its preview: undefined
 * while the amount field is empty or not a number, so the preview shows a
 * dash rather than repeating the current balance. The number field emits a
 * raw string, so an empty field arrives as ''.
 */
export const previewBalance = (
  balance: number | string | null | undefined,
  amount: number | string | null | undefined,
  direction: 'add' | 'subtract' = 'add',
): number | undefined => {
  if (balance == null || amount == null || String(amount) === '') {
    return undefined;
  }
  const delta = Number(amount);
  if (Number.isNaN(delta)) {
    return undefined;
  }
  return Number(balance) + (direction === 'add' ? delta : -delta);
};

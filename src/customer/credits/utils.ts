export const getCreditInitialValues = (row) => ({
  value: row.value,
  end_date: row.end_date,
  minimal_consumption_logic: row.minimal_consumption_logic,
  expected_consumption: row.expected_consumption,
  grace_coefficient: row.grace_coefficient,
  apply_as_minimal_consumption: row.apply_as_minimal_consumption,
});

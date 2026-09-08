/** Pass as `formatOptionLabel`. Description is menu-only, so the control
 * stays one line high. */
export const formatOptionWithDescription = (
  option: { label: string; description?: string },
  meta: { context: 'menu' | 'value' },
) =>
  meta.context === 'menu' && option.description ? (
    <div className="d-flex flex-column">
      <span>{option.label}</span>
      <small className="text-muted">{option.description}</small>
    </div>
  ) : (
    option.label
  );

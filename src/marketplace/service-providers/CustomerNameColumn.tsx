export const CustomerNameColumn = ({ row }) => (
  <>
    <b>{row.name}</b>
    {row.abbreviation && row.abbreviation !== row.name ? (
      <p className="text-muted">{row.abbreviation.toLocaleUpperCase()}</p>
    ) : null}
  </>
);

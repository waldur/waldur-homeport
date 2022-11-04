export const ShortResourceHeader = ({ resource, components }) => {
  const componentsList = components
    .map(
      (component) =>
        `${resource.current_usages[component.type] || 0} / ${
          resource.limits[component.type] || 0
        } ${component.measured_unit} ${component.name}`,
    )
    .join(', ');
  return (
    <div
      style={{
        background: '#2f4050',
        padding: 10,
        display: 'flex',
        color: 'white',
      }}
    >
      <div style={{ flexGrow: 1 }}>{`${resource.name}: ${componentsList}`}</div>
      <div>{`${resource.customer_name} / ${resource.project_name}`}</div>
    </div>
  );
};

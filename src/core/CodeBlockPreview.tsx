export const CodeBlockPreview = ({ code }) => {
  const lines = code.split('\n');

  return (
    <>
      {lines.map((line, index) => (
        <div className="code-block" key={index}>
          <pre>
            <span className="line-number">{index + 1}.</span>
            <span className="me-1 code-block-pre">$</span>
            <span>{line}</span>
          </pre>
        </div>
      ))}
    </>
  );
};

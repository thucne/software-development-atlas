export type DecisionMatrixRow = {
  criterion: string;
  values: readonly string[];
};

export function DecisionMatrix({
  options,
  rows,
  caption,
  criterionLabel = 'Criterion',
}: {
  options: readonly string[];
  rows: readonly DecisionMatrixRow[];
  caption: string;
  criterionLabel?: string;
}) {
  for (const row of rows) {
    if (row.values.length !== options.length) {
      throw new Error(
        `DecisionMatrix row "${row.criterion}" has ${row.values.length} values but expected ${options.length}`,
      );
    }
  }

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="mb-2 text-left font-medium">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="border px-3 py-2 text-left">
              {criterionLabel}
            </th>
            {options.map((option) => (
              <th
                key={option}
                scope="col"
                className="border px-3 py-2 text-left"
              >
                {option}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.criterion}>
              <th scope="row" className="border px-3 py-2 text-left font-medium">
                {row.criterion}
              </th>
              {row.values.map((value, index) => (
                <td key={`${row.criterion}-${options[index]}`} className="border px-3 py-2 align-top">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

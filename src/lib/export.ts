/**
 * Client utility to dynamically load PapaParse on demand for CSV exports.
 * Avoids bundling PapaParse in the initial page payload.
 */
export async function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  filename: string
): Promise<void> {
  if (!data || data.length === 0) return;

  const Papa = (await import("papaparse")).default;
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

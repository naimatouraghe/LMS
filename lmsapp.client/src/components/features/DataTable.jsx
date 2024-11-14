import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';

export function DataTable({
  columns,
  data,
  isLoading,
  noResultsMessage = 'Aucun résultat trouvé',
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b bg-gray-50">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                {noResultsMessage}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b last:border-b-0 hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Page {table.getState().pagination.pageIndex + 1} sur{' '}
          {table.getPageCount()}
        </div>
      </div>
    </div>
  );
}

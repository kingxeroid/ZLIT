import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

export default function DataTable({
  columns = [],
  data = [],
  searchPlaceholder = "Search records...",
  emptyMessage = "No records found.",
  pageSize = 8,
  onRowClick,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return data;

    return data.filter((row) =>
      columns.some((column) => {
        const value = row[column.accessor];
        return String(value ?? "").toLowerCase().includes(query);
      })
    );
  }, [data, columns, search]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="overflow-hidden rounded-card border border-white/[0.06] bg-zlit-surface">
      {/* Search */}
      <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-zlit-white">
          Records
          <span className="ml-2 text-xs font-normal text-zlit-muted">
            ({filteredData.length})
          </span>
        </p>

        <div className="relative w-full sm:max-w-[260px]">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zlit-muted"
          />

          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded-pill border border-white/[0.08] bg-[#1B1B1E] py-2.5 pl-10 pr-4 text-xs text-zlit-white outline-none transition placeholder:text-zlit-muted focus:border-zlit-red"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  className="px-5 py-4 text-[10px] font-semibold uppercase tracking-wider text-zlit-muted"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id ?? index}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-white/[0.04] transition last:border-0 ${
                    onRowClick
                      ? "cursor-pointer hover:bg-white/[0.03]"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.accessor}
                      className="px-5 py-4 text-xs text-zlit-white"
                    >
                      {column.render
                        ? column.render(row[column.accessor], row)
                        : row[column.accessor] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="px-5 py-12 text-center text-xs text-zlit-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
        <p className="text-[10px] text-zlit-muted">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-full bg-[#303034] p-2 text-zlit-white transition hover:bg-zlit-red disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft size={15} />
          </button>

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            className="rounded-full bg-[#303034] p-2 text-zlit-white transition hover:bg-zlit-red disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
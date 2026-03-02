'use client';

import type { Order, OrderLineItem } from '@/types/order';
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronRight } from 'lucide-react';
import { Fragment, memo, useCallback, useMemo, useState } from 'react';

import { MultiSelectFilter } from '@/components/ui/multi-select-filter';

// Row shape flattened for the table
interface OrderRow {
  orderNumber: string;
  storeName: string;
  orderDate: Date;
  totalAmount: number;
  lineItemCount: number;
  supplierNames: string[]; // kept for filtering, not displayed as a column
}

function buildRows(orders: Order[]): OrderRow[] {
  return orders.map((o) => ({
    orderNumber: o.orderNumber,
    storeName: o.storeName,
    orderDate: o.orderDate,
    totalAmount: o.lineItems.reduce((s, i) => s + i.totalPrice, 0),
    lineItemCount: o.lineItems.length,
    supplierNames: [...new Set(o.lineItems.map((i) => i.supplierName))],
  }));
}

// ---------- Memoized row component ----------
// React.memo means a row only re-renders when its own props change.
// Expanding row A won't cause row B, C, D... to re-render.
const ExpandableRow = memo(function ExpandableRow({
  row,
  isExpanded,
  lineItems,
  toggleRow,
  totalColumns,
}: {
  row: Row<OrderRow>;
  isExpanded: boolean;
  lineItems: OrderLineItem[];
  toggleRow: (orderNumber: string) => void;
  totalColumns: number;
}) {
  return (
    <Fragment>
      <tr
        className="hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => toggleRow(row.original.orderNumber)}
      >
        {row.getVisibleCells().map((cell) => (
          <td key={cell.id} className="px-4 py-3 text-gray-800">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
        {/* Chevron rendered outside TanStack so expandedRows never touches columns */}
        <td className="px-4 py-3 text-gray-800">
          <ChevronRight
            className={`h-4 w-4 text-gray-400 transition-transform duration-150 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        </td>
      </tr>
      <tr>
        <td colSpan={totalColumns} className="p-0 bg-gray-50">
          <div
            className={`grid transition-all duration-200 ease-in-out ${
              isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-8 py-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-200">
                      <th className="pb-2 text-left font-semibold">Item Number</th>
                      <th className="pb-2 text-left font-semibold">Supplier Name</th>
                      <th className="pb-2 text-right font-semibold">Unit Price</th>
                      <th className="pb-2 text-right font-semibold">Quantity</th>
                      <th className="pb-2 text-right font-semibold">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lineItems.map((item, idx) => (
                      <tr key={idx} className="text-gray-700">
                        <td className="py-1.5 font-mono">{item.itemNumber}</td>
                        <td className="py-1.5">{item.supplierName}</td>
                        <td className="py-1.5 text-right">
                          ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-1.5 text-right">{item.quantity}</td>
                        <td className="py-1.5 text-right">
                          ${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </Fragment>
  );
});

// ---------- Main table component ----------
export function OrdersTable({ orders }: { orders: Order[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'orderDate', desc: true }]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const lineItemsMap = useMemo(
    () => new Map(orders.map((o) => [o.orderNumber, o.lineItems])),
    [orders]
  );

  // Stable reference — functional update form requires no deps
  const toggleRow = useCallback((orderNumber: string) =>
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(orderNumber) ? next.delete(orderNumber) : next.add(orderNumber);
      return next;
    }),
    []
  );

  const rows = useMemo(() => buildRows(orders), [orders]);

  const storeOptions = useMemo(
    () => [...new Set(rows.map((r) => r.storeName))].sort(),
    [rows]
  );

  const supplierOptions = useMemo(
    () => [...new Set(rows.flatMap((r) => r.supplierNames))].sort(),
    [rows]
  );

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (selectedStores.length > 0 && !selectedStores.includes(row.storeName)) {
        return false;
      }
      if (
        selectedSuppliers.length > 0 &&
        !row.supplierNames.some((s) => selectedSuppliers.includes(s))
      ) {
        return false;
      }
      return true;
    });
  }, [rows, selectedStores, selectedSuppliers]);

  // expandedRows is no longer a dep — the chevron lives outside TanStack columns
  const columns = useMemo<ColumnDef<OrderRow>[]>(
    () => [
      {
        accessorKey: 'orderNumber',
        header: ({ column }) => (
          <SortableHeader
            label="Order Number"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            sorted={column.getIsSorted()}
          />
        ),
        cell: ({ getValue }) => (
          <span className="font-mono text-sm">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'storeName',
        header: ({ column }) => (
          <SortableHeader
            label="Store Name"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            sorted={column.getIsSorted()}
          />
        ),
      },
      {
        accessorKey: 'orderDate',
        header: ({ column }) => (
          <SortableHeader
            label="Order Date"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            sorted={column.getIsSorted()}
          />
        ),
        cell: ({ getValue }) =>
          getValue<Date>().toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
        sortingFn: 'datetime',
      },
      {
        accessorKey: 'totalAmount',
        header: ({ column }) => (
          <SortableHeader
            label="Total Amount"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            sorted={column.getIsSorted()}
            className="text-right"
          />
        ),
        cell: ({ getValue }) => (
          <span className="text-right block">
            $
            {getValue<number>().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        accessorKey: 'lineItemCount',
        header: ({ column }) => (
          <SortableHeader
            label="Line Items"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            sorted={column.getIsSorted()}
            className="text-right"
          />
        ),
        cell: ({ getValue }) => (
          <span className="text-right block">{getValue<number>()}</span>
        ),
      },
    ],
    [] // no expandedRows dep — columns are now truly stable
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // +1 for the manual chevron column outside TanStack
  const totalColumns = columns.length + 1;

  const hasActiveFilters = selectedStores.length > 0 || selectedSuppliers.length > 0;

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Filter by:</span>
        <MultiSelectFilter
          label="Store"
          options={storeOptions}
          selected={selectedStores}
          onChange={setSelectedStores}
        />
        <MultiSelectFilter
          label="Supplier"
          options={supplierOptions}
          selected={selectedSuppliers}
          onChange={setSelectedSuppliers}
        />
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSelectedStores([]);
              setSelectedSuppliers([]);
            }}
            className="text-xs text-gray-500 hover:text-gray-800 underline"
          >
            Clear all filters
          </button>
        )}
        <span className="ml-auto text-sm text-gray-500">
          {filteredRows.length} of {rows.length} orders
        </span>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[420px]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left font-semibold text-gray-700"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                  {/* Header cell for the manual chevron column */}
                  <th className="px-4 py-3" />
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={totalColumns}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No orders match the current filters.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <ExpandableRow
                    key={row.id}
                    row={row}
                    isExpanded={expandedRows.has(row.original.orderNumber)}
                    lineItems={lineItemsMap.get(row.original.orderNumber) ?? []}
                    toggleRow={toggleRow}
                    totalColumns={totalColumns}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------- Sortable header helper ----------
function SortableHeader({
  label,
  onClick,
  sorted,
  className = '',
}: {
  label: string;
  onClick: () => void;
  sorted: false | 'asc' | 'desc';
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 hover:text-gray-900 ${className}`}
    >
      {label}
      <ArrowUpDown
        className={`h-3.5 w-3.5 ${sorted ? 'text-blue-600' : 'text-gray-400'}`}
      />
    </button>
  );
}

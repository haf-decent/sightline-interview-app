'use client';

import { OrdersLineChart } from '@/components/orders-line-chart';
import { OrdersTable } from '@/components/orders-table';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useOrders } from '@/hooks/use-orders';
import { DateRange } from '@/lib/date-presets';
import { createDateWithoutTime } from '@/lib/utils';
import { useEffect, useState } from 'react';

// Helper component for stat boxes
function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

export default function Home() {
  // Initialize with Last 7 Days
  const [dateRange, setDateRange] = useState<DateRange>({
    from: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 6);
      return createDateWithoutTime(date);
    })(),
    to: createDateWithoutTime(new Date()),
    preset: 'Last 7 Days',
  });

  const {
    data: orders,
    isLoading,
    error,
  } = useOrders(dateRange.from, dateRange.to);

  // Console log the data whenever it changes
  useEffect(() => {
    if (orders) {
      console.log(
        `📅 Date range: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
      );
      console.log(
        `📊 Total orders: ${orders.length} | Total line items: ${orders.reduce(
          (sum, o) => sum + o.lineItems.length,
          0
        )}`
      );
      console.log('📦 Orders data:', orders);
    }
  }, [orders, dateRange]);

  // Log helper functions once on mount
  useEffect(() => {
    const logHelperFunctions = async () => {
      const { getStoreNames, getSupplierNames, getItemNumbers } = await import(
        '@/actions/orders'
      );

      const stores = await getStoreNames();
      if (stores.length > 0) {
        console.log('🏪 Available stores:', stores);
      }

      const suppliers = await getSupplierNames();
      if (suppliers.length > 0) {
        console.log('🚚 Available suppliers:', suppliers);
      }

      const items = await getItemNumbers();
      if (items.length > 0) {
        console.log(
          '📋 Available items:',
          items.slice(0, 10),
          `...and ${items.length - 10} more`
        );
      }
    };

    logHelperFunctions();
  }, []);

  const totalLineItems =
    orders?.reduce((sum, order) => sum + order.lineItems.length, 0) || 0;
  const totalAmount =
    orders?.reduce(
      (sum, order) =>
        sum + order.lineItems.reduce((itemSum, item) => itemSum + item.totalPrice, 0),
      0
    ) || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Order Data Interview App
          </h1>

          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder="Select date range"
          />

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Error loading orders: {(error as Error).message}
              </p>
            </div>
          )}

          {orders && !isLoading && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Order History</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatBox
                  label="Total Orders"
                  value={orders.length.toLocaleString()}
                />
                <StatBox
                  label="Total Line Items"
                  value={totalLineItems.toLocaleString()}
                />
                <StatBox
                  label="Total Amount"
                  value={`$${totalAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                />
              </div>

              <OrdersTable orders={orders} />

              <h3 className="text-2xl font-bold text-gray-900">Order Totals by Day</h3>
              <OrdersLineChart orders={orders} from={dateRange.from} to={dateRange.to} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

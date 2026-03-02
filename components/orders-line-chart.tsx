'use client';

import { ResponsiveLine } from '@nivo/line';
import { useMemo } from 'react';
import type { Order } from '@/types/order';

interface OrdersLineChartProps {
  orders: Order[];
  from: Date;
  to: Date;
}

export function OrdersLineChart({ orders, from, to }: OrdersLineChartProps) {
  const data = useMemo(() => {
    
    const counts: Record<string, number> = {}
    for (const order of orders) {
      const key = new Date(order.orderDate)
        .toDateString()
        .split(" ")
        .slice(1)
        .join(" ")
      counts[ key ] = (counts[ key ] || 0) + 1
    }
    const points: { x: string; y: number }[] = Object.entries(counts)
      .sort(([ a ], [ b ]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([ key, count ]) => ({
        x: key,
        y: count
      }))

    return [{ id: 'Orders', data: points }];
  }, [orders, from, to]);

  return (
    <div className="h-64">
      <ResponsiveLine
        data={data}
        margin={{ top: 16, right: 24, bottom: 72, left: 48 }}
        yScale={{ type: 'linear', min: 0, nice: true }}
        axisBottom={{
          tickRotation: -45,
        }}
        axisLeft={{
          tickSize: 0,
          tickPadding: 8,
          legend: 'Orders',
          legendOffset: -40,
          legendPosition: 'middle',
        }}
        curve="linear"
        colors={['#2563eb']}
        lineWidth={2}
        pointSize={6}
        pointColor="#2563eb"
        pointBorderWidth={2}
        pointBorderColor="#ffffff"
        enableArea
        areaOpacity={0.1}
        useMesh
        tooltip={({ point }) => (
          <div className="bg-white border border-gray-200 rounded shadow-sm px-3 py-2 text-sm">
            <div className="font-medium text-gray-900 whitespace-nowrap">{point.data.x.toString()}</div>
            <div className="text-gray-600 whitespace-nowrap">
              {point.data.y as number} {(point.data.y as number) === 1 ? 'order' : 'orders'}
            </div>
          </div>
        )}
        theme={{
          axis: {
            ticks: { text: { fontSize: 11, fill: '#6b7280' } },
            legend: { text: { fontSize: 12, fill: '#374151' } },
          },
          grid: { line: { stroke: '#f3f4f6' } },
        }}
      />
    </div>
  );
}

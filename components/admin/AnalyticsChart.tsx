'use client';

import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';

interface DataPoint {
  date: string;
  views?: number;
  posts?: number;
  comments?: number;
  subscribers?: number;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  type: 'views' | 'posts' | 'comments' | 'subscribers';
  title: string;
  color?: string;
  height?: number;
}

export function AnalyticsChart({
  data,
  type,
  title,
  color = '#00FFD1',
  height = 200,
}: AnalyticsChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { points: '', maxValue: 0, values: [] };

    const values = data.map(d => d[type] || 0);
    const maxValue = Math.max(...values, 1);
    const width = 100; // Percentage width
    const stepX = width / (data.length - 1 || 1);

    const points = values
      .map((value, index) => {
        const x = index * stepX;
        const y = height - (value / maxValue) * (height - 20); // 20px padding
        return `${x},${y}`;
      })
      .join(' ');

    return { points, maxValue, values };
  }, [data, type, height]);

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd');
    } catch {
      return dateStr;
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-text-secondary">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color }}>
            {formatValue(chartData.values[chartData.values.length - 1] || 0)}
          </p>
          <p className="text-xs text-text-secondary">Latest</p>
        </div>
      </div>

      <div className="relative">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 100 ${height}`}
          className="overflow-visible"
        >
          {/* Grid lines */}
          <defs>
            <pattern
              id={`grid-${type}`}
              width="20"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${type})`} />

          {/* Area under curve */}
          <defs>
            <linearGradient id={`gradient-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {chartData.points && (
            <polygon
              points={`0,${height} ${chartData.points} 100,${height}`}
              fill={`url(#gradient-${type})`}
            />
          )}

          {/* Line */}
          {chartData.points && (
            <polyline
              points={chartData.points}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {data.map((_, index) => {
            const x = (index / (data.length - 1 || 1)) * 100;
            const value = chartData.values[index] || 0;
            const y = height - (value / chartData.maxValue) * (height - 20);
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={color}
                className="opacity-0 hover:opacity-100 transition-opacity"
              >
                <title>{`${formatDate(data[index].date)}: ${formatValue(value)}`}</title>
              </circle>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-text-secondary">
          <span>{formatDate(data[0]?.date || '')}</span>
          {data.length > 2 && (
            <span>{formatDate(data[Math.floor(data.length / 2)]?.date || '')}</span>
          )}
          <span>{formatDate(data[data.length - 1]?.date || '')}</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-secondary-light">
        <div className="text-center">
          <p className="text-xs text-text-secondary">Total</p>
          <p className="font-semibold">
            {formatValue(chartData.values.reduce((sum, val) => sum + val, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-text-secondary">Average</p>
          <p className="font-semibold">
            {formatValue(
              chartData.values.length > 0
                ? chartData.values.reduce((sum, val) => sum + val, 0) / chartData.values.length
                : 0
            )}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-text-secondary">Peak</p>
          <p className="font-semibold">{formatValue(chartData.maxValue)}</p>
        </div>
      </div>
    </div>
  );
}
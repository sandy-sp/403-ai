'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Metric {
  label: string;
  value: number;
  previousValue?: number;
  format?: 'number' | 'percentage' | 'duration';
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  color?: string;
}

interface AnalyticsMetricsProps {
  metrics: Metric[];
}

export function AnalyticsMetrics({ metrics }: AnalyticsMetricsProps) {
  const formatValue = (value: number, format: Metric['format'] = 'number') => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        const minutes = Math.floor(value / 60);
        const seconds = Math.floor(value % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      default:
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return Math.round(value).toLocaleString();
    }
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return TrendingUp;
    if (growth < 0) return TrendingDown;
    return Minus;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-status-success';
    if (growth < 0) return 'text-status-error';
    return 'text-text-secondary';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const growth = metric.previousValue !== undefined 
          ? calculateGrowth(metric.value, metric.previousValue)
          : null;
        const GrowthIcon = growth !== null ? getGrowthIcon(growth) : null;
        const growthColor = growth !== null ? getGrowthColor(growth) : '';

        return (
          <div key={index} className="card">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-text-secondary text-sm mb-1">{metric.label}</p>
                <p className="text-2xl font-bold" style={{ color: metric.color }}>
                  {formatValue(metric.value, metric.format)}
                </p>
              </div>
              {Icon && (
                <div className="flex-shrink-0" style={{ color: metric.color }}>
                  <Icon size={24} />
                </div>
              )}
            </div>

            {growth !== null && (
              <div className={`flex items-center gap-1 text-sm ${growthColor}`}>
                {GrowthIcon && <GrowthIcon size={16} />}
                <span className="font-medium">
                  {Math.abs(growth).toFixed(1)}%
                </span>
                <span className="text-text-secondary">vs previous period</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
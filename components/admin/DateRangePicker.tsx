'use client';

import { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { Calendar, ChevronDown } from 'lucide-react';

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presetRanges = [
  {
    label: 'Last 7 days',
    value: '7d',
    getRange: () => ({
      start: subDays(new Date(), 7),
      end: new Date(),
    }),
  },
  {
    label: 'Last 30 days',
    value: '30d',
    getRange: () => ({
      start: subDays(new Date(), 30),
      end: new Date(),
    }),
  },
  {
    label: 'Last 90 days',
    value: '90d',
    getRange: () => ({
      start: subDays(new Date(), 90),
      end: new Date(),
    }),
  },
  {
    label: 'This month',
    value: 'month',
    getRange: () => ({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
    }),
  },
  {
    label: 'This year',
    value: 'year',
    getRange: () => ({
      start: startOfYear(new Date()),
      end: endOfYear(new Date()),
    }),
  },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(format(value.start, 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(value.end, 'yyyy-MM-dd'));

  const handlePresetSelect = (preset: typeof presetRanges[0]) => {
    const range = preset.getRange();
    onChange(range);
    setCustomStart(format(range.start, 'yyyy-MM-dd'));
    setCustomEnd(format(range.end, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    
    if (start <= end) {
      onChange({ start, end });
      setIsOpen(false);
    }
  };

  const getCurrentLabel = () => {
    const preset = presetRanges.find(p => {
      const range = p.getRange();
      return (
        Math.abs(range.start.getTime() - value.start.getTime()) < 24 * 60 * 60 * 1000 &&
        Math.abs(range.end.getTime() - value.end.getTime()) < 24 * 60 * 60 * 1000
      );
    });

    if (preset) {
      return preset.label;
    }

    return `${format(value.start, 'MMM dd, yyyy')} - ${format(value.end, 'MMM dd, yyyy')}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-secondary-light rounded-lg hover:bg-secondary transition-colors"
      >
        <Calendar size={18} />
        <span className="font-medium">{getCurrentLabel()}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-secondary border border-secondary-light rounded-lg shadow-lg z-20">
            <div className="p-4">
              <h3 className="font-semibold mb-3">Select Date Range</h3>

              {/* Preset ranges */}
              <div className="space-y-2 mb-4">
                {presetRanges.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetSelect(preset)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary-light transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom range */}
              <div className="border-t border-secondary-light pt-4">
                <h4 className="font-medium mb-3">Custom Range</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="input w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="input w-full text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCustomApply}
                  className="w-full btn-primary text-sm"
                >
                  Apply Custom Range
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
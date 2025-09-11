import React from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface HealthChartProps {
  title: string;
  type: 'steps' | 'sleep' | 'heartRate';
  timeRange: string;
}

export default function HealthChart({ title, type, timeRange }: HealthChartProps) {
  // Mock data generation based on type and time range
  const generateMockData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      let value;
      switch (type) {
        case 'steps':
          value = Math.floor(Math.random() * 5000) + 6000;
          break;
        case 'sleep':
          value = Math.random() * 2 + 6.5;
          break;
        case 'heartRate':
          value = Math.floor(Math.random() * 20) + 65;
          break;
        default:
          value = Math.random() * 100;
      }
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: value,
      });
    }
    
    return data;
  };

  const data = generateMockData();
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const avgValue = data.reduce((sum, d) => sum + d.value, 0) / data.length;

  const getUnit = () => {
    switch (type) {
      case 'steps': return 'steps';
      case 'sleep': return 'hours';
      case 'heartRate': return 'BPM';
      default: return '';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'steps': return 'blue';
      case 'sleep': return 'purple';
      case 'heartRate': return 'red';
      default: return 'blue';
    }
  };

  const color = getColor();
  const colorClasses = {
    blue: 'stroke-blue-500 fill-blue-500/20',
    purple: 'stroke-purple-500 fill-purple-500/20',
    red: 'stroke-red-500 fill-red-500/20',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BarChart3 className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Average</p>
          <p className="text-lg font-semibold text-gray-900">
            {type === 'sleep' ? avgValue.toFixed(1) : Math.round(avgValue).toLocaleString()} {getUnit()}
          </p>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-64 relative">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y * 2}
              x2="400"
              y2={y * 2}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 380 + 10;
              const y = 180 - ((d.value - minValue) / (maxValue - minValue)) * 160;
              return `${x},${y}`;
            }).join(' ')}
            className={colorClasses[color as keyof typeof colorClasses]}
            strokeWidth="3"
            fill="none"
          />
          
          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 380 + 10;
            const y = 180 - ((d.value - minValue) / (maxValue - minValue)) * 160;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                className={`fill-${color}-500 hover:r-6 transition-all cursor-pointer`}
              >
                <title>{`${d.date}: ${type === 'sleep' ? d.value.toFixed(1) : Math.round(d.value)} ${getUnit()}`}</title>
              </circle>
            );
          })}
        </svg>
      </div>

      {/* Chart Legend */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>{data[0]?.date}</span>
        <div className="flex items-center">
          <TrendingUp className="h-3 w-3 mr-1" />
          <span>
            {((data[data.length - 1]?.value - data[0]?.value) / data[0]?.value * 100).toFixed(1)}% change
          </span>
        </div>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
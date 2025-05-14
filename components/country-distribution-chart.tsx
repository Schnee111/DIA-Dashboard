import { JSX, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// Define TypeScript interfaces
interface DataItem {
  name: string;
  value: number;
}

interface ChartProps {
  data?: DataItem[];
}

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: DataItem;
  }>;
}

export function DistributionChart({ data = [] }: ChartProps): JSX.Element {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  
  // If no data is provided, return empty component
  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Tidak ada data tersedia</p>
      </div>
    );
  }
  
  // Process data for better visualization
  const threshold = 2; // Show countries with 2% or more individually
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  // Separate major and minor countries
  const majorCountries = sortedData.filter(item => item.value >= threshold);
  const minorCountries = sortedData.filter(item => item.value < threshold);
  
  // Calculate sum of minor countries
  const othersValue = minorCountries.reduce((sum, item) => sum + item.value, 0);
  
  // Create simplified data set with top countries and "Others"
  const simplifiedData: DataItem[] = [
    ...majorCountries,
    ...(minorCountries.length > 0 ? [{ name: 'Lainnya', value: othersValue }] : [])
  ];
  
  // Consistent colors for better visualization
  const COLORS = [
    '#2563eb', // Blue - Jepang
    '#f97316', // Orange - Korea Selatan
    '#16a34a', // Green - Malaysia
    '#dc2626', // Red - Filipina
    '#8b5cf6', // Purple - Tiongkok
    '#a16207', // Brown - China
    '#ec4899', // Pink - Prancis
    '#ca8a04', // Yellow - Taiwan
    '#06b6d4', // Teal - Thailand
    '#6b7280', // Gray - ASEAN
    '#f59e0b', // Amber - Norwegia
    '#10b981', // Emerald - Turki
    '#f43f5e', // Rose - Kenya
    '#cbd5e1'  // Slate - Lainnya
  ];
  
  // Custom tooltip for both chart types
  const CustomTooltip = ({ active, payload }: TooltipProps): JSX.Element | null => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded">
          <p className="font-semibold text-gray-800">{`${payload[0].name}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Custom label for pie chart with improved positioning
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: LabelProps): JSX.Element | null => {
    const RADIAN = Math.PI / 180;
    // Increased radius to place labels further from the pie
    const radius = outerRadius * 1.35;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Show labels for all countries with value ≥ 3%
    // This threshold can be adjusted based on your data density
    if (simplifiedData[index].value < 3) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={COLORS[index % COLORS.length]}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${simplifiedData[index].name}: ${simplifiedData[index].value}%`}
      </text>
    );
  };
  
  return (
    <div className="w-full px-4">
      <div className="mb-4 mt-2">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setChartType('pie')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              chartType === 'pie' 
                ? 'bg-gray-700 text-white hover:bg-gray-700' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            Pie Chart
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              chartType === 'bar' 
                ? 'bg-gray-700 text-white hover:bg-gray-700' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            Bar Chart
          </button>
        </div>
      </div>
      
      {/* Increased height for better visualization */}
      <div className="w-full h-96 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={simplifiedData}
                cx="50%"
                cy="50%" // Centered more in the available space
                labelLine={true}
                label={renderCustomizedLabel}
                outerRadius={100} // Adjusted from 100 to 90
                fill="#8884d8"
                dataKey="value"
              >
                {simplifiedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {/* <Legend 
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: 20 }}
              /> */}
            </PieChart>
          ) : (
            <BarChart
              data={sortedData.slice(0, 10)}
              layout="vertical"
              margin={{ top: 5, right: 25, left: 0, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                unit="%" 
                tickLine={true}
                axisLine={true}
                domain={[0, 'dataMax']}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={90} 
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                name="Persentase"
                barSize={25} // Increased bar size
                radius={[0, 4, 4, 0]}
              >
                {sortedData.slice(0, 10).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
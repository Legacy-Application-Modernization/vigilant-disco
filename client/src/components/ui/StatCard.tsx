
import type { FC, ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  description?: string;
  icon: ReactNode;
}

const StatCard: FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  positive = true, 
  description, 
  icon 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-md bg-indigo-50">
          {icon}
        </div>
        <div className="ml-5">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change && (
              <p className={`ml-2 flex items-center text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
                {change}
                <span className="sr-only">{positive ? 'Increase' : 'Decrease'}</span>
              </p>
            )}
          </div>
          {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
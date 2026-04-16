import { ReloadOutlined } from '@ant-design/icons';
import { Button, Select } from 'antd';
import type { OrderStatus } from '../../../types/order';

interface FilterBarProps {
  selectedStatus?: OrderStatus;
  onStatusChange: (status?: OrderStatus) => void;
  onRefresh: () => void;
  loading?: boolean;
}

const STATUS_OPTIONS = [
  { label: 'All Orders', value: '' }, // Use empty string for 'All Orders'
  { label: 'Pending', value: 'pending' as OrderStatus },
  { label: 'Preparing', value: 'preparing' as OrderStatus },
  { label: 'Ready', value: 'ready' as OrderStatus },
  { label: 'Completed', value: 'completed' as OrderStatus },
  { label: 'Cancelled', value: 'cancelled' as OrderStatus },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedStatus,
  onStatusChange,
  onRefresh,
  loading = false,
}) => {
  // Convert undefined selectedStatus to '' for controlled Select
  const selectValue = selectedStatus ?? '';

  // Handle the status change and map '' (All Orders) back to undefined
  const handleStatusChange = (value: string) => {
    // If value is empty string, remove filter by calling with undefined
    if (value === '') {
      onStatusChange(undefined);
    } else {
      onStatusChange(value as OrderStatus);
    }
  };

  return (
    <div className="flex justify-between items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status:</span>
        <Select
          style={{ width: 200 }}
          value={selectValue}
          onChange={handleStatusChange}
          options={STATUS_OPTIONS}
          placeholder="Select status"
        />
      </div>
      <Button
        icon={<ReloadOutlined />}
        onClick={onRefresh}
        loading={loading}
        data-tooltip-id="global"
        data-tooltip-content="Refresh orders"
      >
        Refresh
      </Button>
    </div>
  );
};

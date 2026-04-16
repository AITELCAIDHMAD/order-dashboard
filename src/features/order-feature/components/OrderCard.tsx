import { Button, Card, Space, Tag, message } from 'antd';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import type { Order, OrderStatus } from '../../../types/order';

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'gold',
  preparing: 'blue',
  ready: 'green',
  completed: 'default',
  cancelled: 'red',
};

const STATUS_NEXT_ACTION: Partial<Record<OrderStatus, { nextStatus: OrderStatus; label: string }>> = {
  pending: { nextStatus: 'preparing', label: 'Start Preparing' },
  preparing: { nextStatus: 'ready', label: 'Mark Ready' },
  ready: { nextStatus: 'completed', label: 'Complete Order' },
};

const formatCurrency = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (): Promise<void> => {
    const nextAction = STATUS_NEXT_ACTION[order.status];
    if (!nextAction) return;

    setUpdating(true);
    try {
      await onStatusUpdate(order.id, nextAction.nextStatus);
      message.success(`Order status updated to ${nextAction.nextStatus}`);
    } catch (error) {
      message.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async (): Promise<void> => {
    if (order.status === 'completed' || order.status === 'cancelled') {
      return;
    }

    setUpdating(true);
    try {
      await onStatusUpdate(order.id, 'cancelled');
      message.success('Order cancelled');
    } catch (error) {
      message.error('Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  const nextAction = STATUS_NEXT_ACTION[order.status];
  const canCancel = order.status !== 'completed' && order.status !== 'cancelled';

  return (
    <>
      <Card
        className="hover:shadow-lg transition-shadow"
        size="small"
        title={
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold">{order.guestName}</span>
            <Tag color={STATUS_COLORS[order.status]} className="text-xs">
              {order.status.toUpperCase()}
            </Tag>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Items:</p>
            <ul className="list-none p-0 m-0 space-y-1">
              {order.items.map((item, index) => (
                <li key={index} className="text-sm">
                  {item.quantity}x {item.name} - {formatCurrency(item.price * item.quantity)}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-sm font-semibold">Total:</span>
            <span className="text-base font-bold text-blue-600">{formatCurrency(order.total)}</span>
          </div>

          <div className="text-xs text-gray-500">
            <p>Created: {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</p>
            <p>Updated: {formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true })}</p>
          </div>

          {(nextAction || canCancel) && (
            <Space className="w-full pt-2" orientation="horizontal" size="small">
              {nextAction && (
                <Button
                  type="primary"
                  loading={updating}
                  onClick={handleStatusUpdate}
                  className="flex-1"
                  data-tooltip-id="global"
                  data-tooltip-content={`Advance order to ${nextAction.nextStatus} status`}
                >
                  {nextAction.label}
                </Button>
              )}
              {canCancel && (
                <Button
                  danger
                  loading={updating}
                  onClick={handleCancel}
                  data-tooltip-id="global"
                  data-tooltip-content="Cancel this order"
                >
                  Cancel
                </Button>
              )}
            </Space>
          )}
        </div>
      </Card>
      <Tooltip id="global" />
    </>
  );
};

import { Alert, Card, Col, Empty, Row, Spin, Statistic } from 'antd';
import { useOrders, useUpdateOrderStatus } from '../hooks/useOrdersQuery';
import { useOrderFiltersStore } from '../store/orderFiltersStore';
import type { OrderStatus } from '../types/order';
import { FilterBar } from './FilterBar';
import { OrderCard } from './OrderCard';

//hi

export const OrderDashboard: React.FC = () => {
  const { status, setStatus } = useOrderFiltersStore();
  const { data, isLoading, error, refetch } = useOrders(status, 1);
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const orders = data?.orders || [];

  const handleStatusFilterChange = (newStatus?: OrderStatus): void => {
    setStatus(newStatus);
  };

  const handleRefresh = async (): Promise<void> => {
    await refetch();
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus): Promise<void> => {
    await updateOrderStatusMutation.mutateAsync({ orderId, newStatus });
  };

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">


        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Order Dashboard
          </h1>

          <p className="text-base text-gray-600 dark:text-gray-400">
            Real-time venue order management
          </p>
        </div>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pending"
                value={stats.pending}
                styles={{ content: { color: '#faad14' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Preparing"
                value={stats.preparing}
                styles={{ content: { color: '#1890ff' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Ready"
                value={stats.ready}
                styles={{ content: { color: '#52c41a' } }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Completed"
                value={stats.completed}
                styles={{ content: { color: '#8c8c8c' } }}
              />
            </Card>
          </Col>
        </Row>

        <FilterBar
          selectedStatus={status}
          onStatusChange={handleStatusFilterChange}
          onRefresh={handleRefresh}
          loading={isLoading}
        />

        <div className="mt-6">
          {error && (
            <Alert
              message="Error"
              description={(error as Error).message}
              type="error"
              showIcon
              closable
              className="mb-4"
            />
          )}

          {isLoading && !orders.length ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="large" />
            </div>
          ) : orders.length === 0 ? (
            <Empty
              description={
                status
                  ? `No ${status} orders found`
                  : 'No orders found'
              }
              className="py-12"
            />
          ) : (
            <Row gutter={[16, 16]}>
              {orders.map(order => (
                <Col xs={24} sm={24} md={12} lg={8} xl={6} key={order.id}>
                  <OrderCard order={order} onStatusUpdate={handleUpdateOrderStatus} />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
    </div>
  );
};

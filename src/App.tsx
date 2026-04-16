import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Spin, theme } from 'antd';
import { Suspense, lazy } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import 'react-tooltip/dist/react-tooltip.css';

// Correct lazy-loading for default export
const OrderPage = lazy(() =>
  import('./features/order-feature/pages/OrderPage').then(module => ({ default: module.OrderPage }))
);
const SettingPage = lazy(() =>
  import('./features/setting-feature/pages/SettingPage').then(module => ({ default: module.SettingPage }))
);
const NotFoundPage = lazy(() =>
  import('./shared/pages/NotFoundPage').then(module => ({ default: module.NotFoundPage }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const isDarkMode =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <Router>
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Navigate to="/order" replace />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/setting" element={<SettingPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Router>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;

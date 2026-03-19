import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './contexts/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import PlanList from './pages/PlanList';
import WorksCatalog from './pages/WorksCatalog';
import { Box, CircularProgress } from '@mui/material';

// 簡易的なローディング表示
const SimpleLoader = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
    </Box>
);

// ログイン済みユーザー向けのルートガード
const ProtectedRoute = ({ children }) => {
    const { user, authLoading } = useData();
    if (authLoading) return <SimpleLoader />;
    if (!user) return <Navigate to="/login" replace />;
    return <Layout>{children}</Layout>;
};

// 管理者専用のルートガード
const AdminRoute = ({ children }) => {
    const { user, loading } = useData();
    if (loading) return <SimpleLoader />;
    // ユーザー情報のroleが'admin'であるかを確認
    if (user?.role !== 'admin') {
        // 管理者でなければダッシュボードにリダイレクト
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

// メインのAppコンポーネント
function App() {
    const { authLoading, user, loading } = useData();

    // 認証情報または基本データの読み込み中はローディング画面を表示
    if (authLoading || (user && loading)) {
        return <SimpleLoader />;
    }

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
                path="/*" 
                element={
                    <ProtectedRoute>
                        <Routes>
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="customers/:id" element={<CustomerDetail />} />

                            {/* 管理者専用ルート */}
                            <Route path="customers" element={<AdminRoute><CustomerList /></AdminRoute>} />
                            <Route path="plans" element={<AdminRoute><PlanList /></AdminRoute>} />
                            <Route path="works-catalog" element={<AdminRoute><WorksCatalog /></AdminRoute>} />
                            
                            {/* 想定外のパスはダッシュボードにリダイレクト */}
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

// アプリケーション全体をBrowserRouterとDataProviderでラップ
const AppWrapper = () => (
    <BrowserRouter>
        <DataProvider>
            <App />
        </DataProvider>
    </BrowserRouter>
);

export default AppWrapper;

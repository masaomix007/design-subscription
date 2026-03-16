import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useData } from './contexts/DataContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import PlanList from './pages/PlanList';
import WorksCatalog from './pages/WorksCatalog';
import Works from './pages/Works';
import Login from './pages/Login';
import { Box, CircularProgress, Typography } from '@mui/material';

const FullScreenLoader = ({ message = '読み込み中...' }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>{message}</Typography>
    </Box>
);

function App() {
    const { user, authLoading, loading } = useData();

    // 認証チェック中
    if (authLoading) {
        return <FullScreenLoader message="認証情報を確認中..." />;
    }

    // 未ログインならログイン画面へ
    if (!user) {
        return (
            <Routes>
                <Route path="*" element={<Login />} />
            </Routes>
        );
    }

    // データ読み込み中
    if (loading) {
        return <FullScreenLoader />;
    }

    // ログイン済みなら全てのルートを解放（0.mp4の状態）
    return (
        <Layout>
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/customers" element={<CustomerList />} />
                <Route path="/customers/:id" element={<CustomerDetail />} />
                <Route path="/plans" element={<PlanList />} />
                <Route path="/works-catalog" element={<WorksCatalog />} />
                <Route path="/works" element={<Works />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Layout>
    );
}

export default App;
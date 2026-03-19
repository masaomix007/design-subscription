import React from 'react';
import { useData } from '../contexts/DataContext';
import { Box, Grid, Paper, Typography, CircularProgress, Alert } from '@mui/material';

const Dashboard = () => {
    // authLoading, currentUserCustomer, getCustomerPlanDetails を追加で取得
    const { 
        customers, plans, loading, authLoading, user, 
        currentUserCustomer, getCustomerPlanDetails 
    } = useData();

    // 認証とデータ取得の両方が完了するまでローディング表示
    if (loading || authLoading) {
        return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;
    }

    const isAdmin = user?.role === 'admin';
    
    // ユーザー名（管理者）または顧客名を取得。currentUserCustomerが存在しない場合も考慮
    const welcomeName = isAdmin 
        ? user?.displayName || user?.email || '管理者' 
        : currentUserCustomer?.name || 'ゲスト';
    
    // 顧客のプラン情報を取得
    const customerPlan = !isAdmin && currentUserCustomer 
        ? getCustomerPlanDetails(currentUserCustomer.planId)
        : null;

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                ようこそ、{welcomeName}さん
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {isAdmin ? '管理用ダッシュボードへようこそ。' : 'マイページへようこそ。'}
            </Typography>

            {/* 管理者向け情報 */}
            {isAdmin && (
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#e3f2fd', color: '#0d47a1', borderRadius: 2 }}>
                            <Typography variant="h6">総顧客数</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{customers.length}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f1f8e9', color: '#33691e', borderRadius: 2 }}>
                            <Typography variant="h6">登録プラン数</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{plans.length}</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* 顧客向け情報 (currentUserCustomerが存在する場合) */}
            {!isAdmin && currentUserCustomer && customerPlan && (
                 <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, bgcolor: '#fff3e0', color: '#e65100', borderRadius: 2 }}>
                            <Typography variant="h6">ご契約中のプラン</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{customerPlan.planName}</Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                {customerPlan.monthlyPoints} pt / 月
                            </Typography>
                        </Paper>
                    </Grid>
                     <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, bgcolor: '#e8eaf6', color: '#1a237e', borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h6">保有ポイント</Typography>
                             <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                 左の「顧客情報」からご確認ください
                             </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}
            
            {/* 顧客情報が見つからない場合の警告 (顧客ユーザー向け) */}
            {!isAdmin && !currentUserCustomer && !(loading || authLoading) && (
                <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
                    お客様の顧客情報が見つかりませんでした。お手数ですが、システム管理者にご連絡ください。
                </Alert>
            )}

            <Box sx={{ mt: 5 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>メニューのご案内</Typography>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Typography color="text.secondary">
                        {isAdmin 
                            ? "左側のメニューから各機能をご利用いただけます。「顧客一覧」から各顧客の詳細情報を確認・編集できます。"
                            : "左側のメニューにある「顧客情報」から、ご自身の契約状況、制作実績、ポイント履歴などを詳しくご確認いただけます。"
                        }
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default Dashboard;

import React from 'react';
import { useData } from '../contexts/DataContext';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';

const Dashboard = () => {
    const { customers, plans, loading } = useData();

    if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>ダッシュボード</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                        <Typography variant="h6">総顧客数</Typography>
                        <Typography variant="h3">{customers.length}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f1f8e9' }}>
                        <Typography variant="h6">公開プラン数</Typography>
                        <Typography variant="h3">{plans.length}</Typography>
                    </Paper>
                </Grid>
            </Grid>
            
            <Box sx={{ mt: 5 }}>
                <Typography variant="h5" gutterBottom>最近の更新</Typography>
                <Paper sx={{ p: 2 }}>
                    <Typography color="text.secondary">
                        各顧客の詳細データは「顧客一覧」から確認できます。
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default Dashboard;
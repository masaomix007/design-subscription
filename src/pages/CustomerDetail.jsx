import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { 
    Box, Typography, Button, Paper, Grid, CircularProgress, Alert, Chip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, Divider,
    TextField, Select, MenuItem, FormControl, InputLabel, TableSortLabel
} from '@mui/material';
import { 
    Add as AddIcon, ArrowBack as ArrowBackIcon, AccountCircle, 
    Assignment, Toll, Download as DownloadIcon, Save as SaveIcon 
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import TaskForm from '../components/TaskForm';

const CustomerDetail = () => {
    const { id } = useParams();
    const { customers, plans, works, transactions, loading, user } = useData();
    const [taskFormOpen, setTaskFormOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    
    const [adjType, setAdjType] = useState('grant'); 
    const [adjPoints, setAdjPoints] = useState('');
    const [adjMemo, setAdjMemo] = useState('');
    const [isAdjusting, setIsAdjusting] = useState(false);
    const [workSortBy, setWorkSortBy] = useState('dateUsed');
    const [workSortDirection, setWorkSortDirection] = useState('desc');

    const customer = customers.find(c => c.id === id);
    const customerWorks = works[id] || [];
    const customerTransactions = transactions[id] || [];

    const formatSafeDate = (dateStr, formatStr) => {
        if (!dateStr || typeof dateStr !== 'string') return '-';
        try {
            return format(parseISO(dateStr), formatStr);
        } catch {
            return '-';
        }
    };

    if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;
    if (!customer) return <Box sx={{ p: 3 }}><Alert severity="warning">顧客が見つかりません</Alert></Box>;

    const plan = plans.find(p => p.id === customer.planId);
    const planName = plan ? plan.name : '未設定';
    const monthlyPoints = plan ? (Number(plan.monthlyPoints) || 0) : 0;
    const canCarryOver = plan ? (plan.canCarryOver ? '可' : '不可') : '-';
    
    const totalPoints = customerTransactions.reduce((acc, tr) => {
        return acc + (Number(tr.points) || 0);
    }, 0);

    const isAdmin = user?.role === 'admin';

    const handleWorkSort = (field) => {
        const isAsc = workSortBy === field && workSortDirection === 'asc';
        setWorkSortBy(field);
        setWorkSortDirection(isAsc ? 'desc' : 'asc');
    };

    const getWorkSortValue = (work, field) => {
        if (field === 'dateUsed') {
            const timestamp = Date.parse(work?.dateUsed || '');
            return Number.isNaN(timestamp) ? 0 : timestamp;
        }
        if (field === 'pointsUsed') return Number(work?.pointsUsed) || 0;
        if (field === 'status') return work?.status || '制作中';
        return work?.name || '';
    };

    const sortedCustomerWorks = [...customerWorks].sort((a, b) => {
        const aValue = getWorkSortValue(a, workSortBy);
        const bValue = getWorkSortValue(b, workSortBy);
        let result = 0;

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            result = aValue - bValue;
        } else {
            result = String(aValue).localeCompare(String(bValue), 'ja', { numeric: true, sensitivity: 'base' });
        }

        return workSortDirection === 'asc' ? result : -result;
    });

    const handleAddMonthlyPoints = async () => {
        if (!plan) {
            alert("プランが設定されていません。");
            return;
        }
        try {
            await addDoc(collection(db, 'transactions'), {
                customerId: id,
                points: monthlyPoints,
                type: 'grant',
                description: `月次ポイント付与 (${planName})`,
                date: new Date().toISOString()
            });
            alert(`${planName}のポイント（${monthlyPoints}pt）を付与しました`);
        } catch (e) {
            alert("付与エラー: " + e.message);
        }
    };

    const handleManualAdjustment = async () => {
        if (!adjPoints || isNaN(adjPoints)) {
            alert("ポイントを数値で入力してください");
            return;
        }
        setIsAdjusting(true);
        try {
            const pointsValue = adjType === 'grant' ? Math.abs(Number(adjPoints)) : -Math.abs(Number(adjPoints));
            await addDoc(collection(db, 'transactions'), {
                customerId: id,
                points: pointsValue,
                type: adjType,
                description: adjMemo || (adjType === 'grant' ? '手動付与' : '手動消費'),
                date: new Date().toISOString()
            });
            setAdjPoints('');
            setAdjMemo('');
            alert("ポイントを更新しました");
        } catch {
            alert("更新に失敗しました");
        } finally {
            setIsAdjusting(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Button component={Link} to="/customers" startIcon={<ArrowBackIcon />} sx={{ mb: 2, textTransform: 'none' }}>
                顧客一覧に戻る
            </Button>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, color: 'primary.main' }}>
                            <AccountCircle />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>アカウント情報</Typography>
                        </Stack>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={1}>
                            <Typography variant="caption" color="text.secondary">会社名 / 担当者</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{customer.name} / {customer.contactName || '-'}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>メールアドレス</Typography>
                            <Box sx={{ pl: 1 }}>
                                {Array.isArray(customer.email) ? (
                                    customer.email.map((email, index) => (
                                        <Typography key={index} variant="body2">{email}</Typography>
                                    ))
                                ) : (
                                    <Typography variant="body2">{customer.email || '-'}</Typography>
                                )}
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>メモ</Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', bgcolor: '#f9f9f9', p: 1, borderRadius: 1 }}>
                                {customer.memo || '-'}
                            </Typography>
                        </Stack>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, color: 'secondary.main' }}>
                            <Assignment />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>契約プラン</Typography>
                        </Stack>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                            <Box><Typography variant="caption" color="text.secondary">適用プラン</Typography><Typography variant="h6" sx={{ fontWeight: 'bold' }}>{planName}</Typography></Box>
                            <Box><Typography variant="caption" color="text.secondary">月次付与 / 繰越</Typography><Typography variant="body1">{monthlyPoints.toLocaleString()} pt / {canCarryOver}</Typography></Box>
                        </Stack>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Paper sx={{ 
                        p: 3, height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', 
                        justifyContent: 'center', alignItems: 'center', bgcolor: 'primary.main', color: 'white'
                    }}>
                        <Toll sx={{ fontSize: 40, mb: 0.5 }} />
                        <Typography variant="h6" sx={{ opacity: 0.8 }}>現在の保有ポイント</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{totalPoints.toLocaleString()}</Typography>
                        <Typography variant="h6" sx={{ mb: 2 }}>pt</Typography>
                        
                        {isAdmin && (
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                size="small" 
                                startIcon={<AddIcon />}
                                onClick={handleAddMonthlyPoints}
                                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f0f0f0' }, textTransform: 'none' }}
                            >
                                月次ポイント付与
                            </Button>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {isAdmin && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>制作実績｜作業状況</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedTask(null); setTaskFormOpen(true); }}>
                        新規制作実績追加
                    </Button>
                </Box>
            )}

            <TableContainer component={Paper} sx={{ mb: 5, borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={workSortBy === 'dateUsed'}
                                    direction={workSortBy === 'dateUsed' ? workSortDirection : 'asc'}
                                    onClick={() => handleWorkSort('dateUsed')}
                                >
                                    実施日
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={workSortBy === 'name'}
                                    direction={workSortBy === 'name' ? workSortDirection : 'asc'}
                                    onClick={() => handleWorkSort('name')}
                                >
                                    制作物名
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={workSortBy === 'pointsUsed'}
                                    direction={workSortBy === 'pointsUsed' ? workSortDirection : 'asc'}
                                    onClick={() => handleWorkSort('pointsUsed')}
                                >
                                    消費pt
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={workSortBy === 'status'}
                                    direction={workSortBy === 'status' ? workSortDirection : 'asc'}
                                    onClick={() => handleWorkSort('status')}
                                >
                                    ステータス
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>納品URL</TableCell>
                            {isAdmin && <TableCell align="center" sx={{ fontWeight: 'bold' }}>操作</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedCustomerWorks.map(work => (
                            <TableRow key={work.id} hover>
                                <TableCell sx={{ fontSize: '0.85rem' }}>{formatSafeDate(work.dateUsed, 'yyyy/MM/dd')}</TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{work.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{work.memo}</Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{work.pointsUsed} pt</TableCell>
                                <TableCell align="center">
                                    <Chip label={work.status || '制作中'} size="small" 
                                        sx={{ fontWeight: 'bold', bgcolor: work.status === '校了' ? '#e8f5e9' : '#ffebee', color: work.status === '校了' ? '#2e7d32' : '#c62828' }}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    {work.deliveryUrl && <Button size="small" variant="outlined" startIcon={<DownloadIcon />} href={work.deliveryUrl} target="_blank">ダウンロード</Button>}
                                </TableCell>
                                {isAdmin && (
                                    <TableCell align="center">
                                        <Button size="small" onClick={() => { setSelectedTask(work); setTaskFormOpen(true); }}>編集</Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {isAdmin && (
                <Box sx={{ mb: 5 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>ポイントの調整</Typography>
                    <Paper sx={{ p: 2, bgcolor: '#fdfdfd', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={2}><FormControl fullWidth size="small"><InputLabel>種別</InputLabel><Select value={adjType} label="種別" onChange={(e) => setAdjType(e.target.value)}><MenuItem value="grant">付与 (+)</MenuItem><MenuItem value="consumption">消費 (-)</MenuItem></Select></FormControl></Grid>
                            <Grid item xs={12} sm={2}><TextField fullWidth size="small" label="ポイント" type="number" value={adjPoints} onChange={(e) => setAdjPoints(e.target.value)} /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="備考（メモ）" value={adjMemo} onChange={(e) => setAdjMemo(e.target.value)} /></Grid>
                            <Grid item xs={12} sm={2}><Button fullWidth variant="contained" color="primary" startIcon={isAdjusting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} onClick={handleManualAdjustment} disabled={isAdjusting}>実行</Button></Grid>
                        </Grid>
                    </Paper>
                </Box>
            )}

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>取引履歴</Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}><TableRow><TableCell sx={{ fontWeight: 'bold' }}>日時</TableCell><TableCell sx={{ fontWeight: 'bold' }}>種別</TableCell><TableCell sx={{ fontWeight: 'bold' }}>内容</TableCell><TableCell align="right" sx={{ fontWeight: 'bold' }}>ポイント数</TableCell></TableRow></TableHead>
                    <TableBody>
                        {customerTransactions.map(tr => (
                            <TableRow key={tr.id} hover>
                                <TableCell sx={{ fontSize: '0.85rem' }}>{formatSafeDate(tr.date, 'yyyy/MM/dd HH:mm')}</TableCell>
                                <TableCell><Chip label={tr.type === 'grant' ? '付与' : '消費'} size="small" variant="outlined" /></TableCell>
                                <TableCell>{tr.description || tr.memo}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: tr.points > 0 ? 'success.main' : 'error.main' }}>{tr.points > 0 ? `+${tr.points}` : tr.points} pt</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {taskFormOpen && <TaskForm open={taskFormOpen} onClose={() => setTaskFormOpen(false)} customerId={id} task={selectedTask} />}
        </Box>
    );
};

export default CustomerDetail;

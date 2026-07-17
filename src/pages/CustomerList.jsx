import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { db } from '../firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, CircularProgress, 
    Button, IconButton, Stack, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, MenuItem, Tooltip,
    TableSortLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';

const CustomerList = () => {
    const { customers, plans, loading, user, currentUserCustomer } = useData();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState({ name: '', planId: '', email: [] });
    const [isNew, setIsNew] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (!isAdmin && currentUserCustomer) {
            navigate(`/customers/${currentUserCustomer.id}`, { replace: true });
        }
    }, [isAdmin, currentUserCustomer, navigate]);

    if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    if (!isAdmin) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>情報を読み込んでいます...</Typography>
            </Box>
        );
    }

    const handleOpenAdd = () => {
        setSelectedCustomer({ name: '', planId: '', email: '', contactName: '', memo: '' });
        setIsNew(true);
        setOpen(true);
    };

    const handleEdit = (customer) => {
        setSelectedCustomer({ 
            ...customer, 
            email: Array.isArray(customer.email) ? customer.email.join(', ') : customer.email 
        });
        setIsNew(false);
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            const emailArray = typeof selectedCustomer.email === 'string' 
                ? selectedCustomer.email.split(',').map(e => e.trim()).filter(e => e) 
                : [];

            const data = {
                name: selectedCustomer.name || '',
                planId: selectedCustomer.planId || '',
                email: emailArray,
                contactName: selectedCustomer.contactName || '',
                memo: selectedCustomer.memo || '',
                updatedAt: serverTimestamp()
            };

            if (isNew) {
                await addDoc(collection(db, 'customers'), { ...data, createdAt: serverTimestamp() });
            } else {
                await updateDoc(doc(db, 'customers', selectedCustomer.id), data);
            }
            setOpen(false);
        } catch (e) { alert("保存に失敗しました: " + e.message); }
    };

    const handleImmediateDelete = async (id) => {
        if (!id) return;
        if (window.confirm("本当にこの顧客を削除しますか？関連するデータも失われる可能性があります。")) {
            try {
                await deleteDoc(doc(db, 'customers', id));
            } catch (e) { console.error(e); }
        }
    };

    const getPlanName = (planId) => {
        const plan = plans.find(p => p.id === planId);
        return plan ? plan.name : '未設定';
    };

    const getEmailText = (email) => {
        if (Array.isArray(email)) return email.join(', ');
        return email || '';
    };

    const getSortValue = (customer, field) => {
        if (field === 'planName') return getPlanName(customer.planId);
        if (field === 'email') return getEmailText(customer.email);
        return customer.name || '';
    };

    const handleSort = (field) => {
        const isAsc = sortBy === field && sortDirection === 'asc';
        setSortBy(field);
        setSortDirection(isAsc ? 'desc' : 'asc');
    };

    const sortedCustomers = [...customers].sort((a, b) => {
        const aValue = String(getSortValue(a, sortBy)).toLocaleLowerCase();
        const bValue = String(getSortValue(b, sortBy)).toLocaleLowerCase();
        const result = aValue.localeCompare(bValue, 'ja', { numeric: true, sensitivity: 'base' });
        return sortDirection === 'asc' ? result : -result;
    });

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>顧客一覧</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                    新規顧客追加
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={sortBy === 'name'}
                                    direction={sortBy === 'name' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('name')}
                                >
                                    顧客名
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={sortBy === 'planName'}
                                    direction={sortBy === 'planName' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('planName')}
                                >
                                    プラン
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={sortBy === 'email'}
                                    direction={sortBy === 'email' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('email')}
                                >
                                    メールアドレス
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedCustomers.map((customer) => {
                            const planName = getPlanName(customer.planId);
                            return (
                                <TableRow key={customer.id} hover>
                                    <TableCell sx={{ fontWeight: '500' }}>{customer.name}</TableCell>
                                    <TableCell>{planName}</TableCell>
                                    <TableCell>{getEmailText(customer.email)}</TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Tooltip title="詳細表示">
                                                <IconButton onClick={() => navigate(`/customers/${customer.id}`)} sx={{ color: '#1976d2' }}>
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <IconButton onClick={() => handleEdit(customer)} sx={{ color: '#757575' }}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleImmediateDelete(customer.id)} sx={{ color: '#d32f2f' }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>{isNew ? '新規顧客追加' : '顧客情報編集'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="顧客名（会社名）" fullWidth value={selectedCustomer.name} onChange={(e) => setSelectedCustomer({...selectedCustomer, name: e.target.value})} />
                        <TextField label="担当者名" fullWidth value={selectedCustomer.contactName || ''} onChange={(e) => setSelectedCustomer({...selectedCustomer, contactName: e.target.value})} />
                        <TextField select label="プラン" fullWidth value={selectedCustomer.planId || ''} onChange={(e) => setSelectedCustomer({...selectedCustomer, planId: e.target.value})}>
                            {plans.map((option) => (
                                <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField 
                            label="メールアドレス（カンマ区切り）" 
                            fullWidth 
                            value={selectedCustomer.email}
                            onChange={(e) => setSelectedCustomer({...selectedCustomer, email: e.target.value})} 
                        />
                        <TextField label="メモ" fullWidth multiline rows={3} value={selectedCustomer.memo || ''} onChange={(e) => setSelectedCustomer({...selectedCustomer, memo: e.target.value})} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)} color="inherit">キャンセル</Button>
                    <Button onClick={handleSave} variant="contained">保存する</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CustomerList;

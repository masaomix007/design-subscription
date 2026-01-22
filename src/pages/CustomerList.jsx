import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { db } from '../firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // 画面遷移用に追加
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, CircularProgress, 
    Button, IconButton, Stack, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, MenuItem, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility'; // 詳細用アイコン

const CustomerList = () => {
    const { customers, plans, loading } = useData();
    const navigate = useNavigate(); // 遷移用フック
    const [open, setOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState({ name: '', planId: '', email: '' });
    const [isNew, setIsNew] = useState(false);

    if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    const handleOpenAdd = () => {
        setSelectedCustomer({ name: '', planId: '', email: '' });
        setIsNew(true);
        setOpen(true);
    };

    const handleEdit = (customer) => {
        setSelectedCustomer({ ...customer });
        setIsNew(false);
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            const data = {
                name: selectedCustomer.name || '',
                planId: selectedCustomer.planId || '',
                email: selectedCustomer.email || '',
                contactName: selectedCustomer.contactName || '',
                memo: selectedCustomer.memo || '', // 正解のキー「memo」を使用
                updatedAt: serverTimestamp()
            };

            if (isNew) {
                await addDoc(collection(db, 'customers'), {
                    ...data,
                    createdAt: serverTimestamp()
                });
            } else {
                await updateDoc(doc(db, 'customers', selectedCustomer.id), data);
            }
            setOpen(false);
        } catch (e) { alert("保存に失敗しました: " + e.message); }
    };

    const handleImmediateDelete = async (id) => {
        if (!id) return;
        try {
            await deleteDoc(doc(db, 'customers', id));
        } catch (e) { console.error(e); }
    };

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
                            <TableCell sx={{ fontWeight: 'bold' }}>顧客名</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>プラン</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>メールアドレス</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map((customer) => {
                            const plan = plans.find(p => p.id === customer.planId);
                            return (
                                <TableRow key={customer.id} hover>
                                    <TableCell sx={{ fontWeight: '500' }}>{customer.name}</TableCell>
                                    <TableCell>{plan ? plan.name : '未設定'}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            {/* ★ 詳細ボタンを追加 */}
                                            <Tooltip title="詳細表示">
                                            <IconButton 
                                                onClick={() => navigate(`/customers/${customer.id}`)} // customer ではなく customers
                                                sx={{ color: '#1976d2' }}
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                            </Tooltip>
                                            
                                            <IconButton onClick={() => handleEdit(customer)} sx={{ color: '#757575' }}>
                                                <EditIcon />
                                            </IconButton>
                                            
                                            <IconButton onClick={() => handleImmediateDelete(customer.id)} sx={{ color: '#757575' }}>
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
                        <TextField 
                            select 
                            label="プラン" 
                            fullWidth 
                            value={selectedCustomer.planId || ''} 
                            onChange={(e) => setSelectedCustomer({...selectedCustomer, planId: e.target.value})}
                        >
                            {plans.map((option) => (
                                <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                            ))}
                        </TextField>
                        <TextField label="メールアドレス" fullWidth value={selectedCustomer.email} onChange={(e) => setSelectedCustomer({...selectedCustomer, email: e.target.value})} />
                        <TextField 
                            label="メモ" 
                            fullWidth 
                            multiline 
                            rows={3} 
                            value={selectedCustomer.memo || ''} // memoを参照
                            onChange={(e) => setSelectedCustomer({...selectedCustomer, memo: e.target.value})} 
                        />
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
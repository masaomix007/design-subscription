import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { db } from '../firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, CircularProgress, 
    Button, IconButton, Stack, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, Switch, FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const PlanList = () => {
    const { plans, loading } = useData();
    const [open, setOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState({ name: '', monthlyPoints: 0, canCarryOver: true, notes: '' });
    const [isNew, setIsNew] = useState(false);

    if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    const handleOpenAdd = () => {
        setSelectedPlan({ name: '', monthlyPoints: 0, canCarryOver: true, notes: '' });
        setIsNew(true);
        setOpen(true);
    };

    const handleEdit = (plan) => {
        setSelectedPlan({ ...plan });
        setIsNew(false);
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            const data = {
                name: selectedPlan.name || '',
                monthlyPoints: Number(selectedPlan.monthlyPoints) || 0,
                canCarryOver: Boolean(selectedPlan.canCarryOver),
                notes: selectedPlan.notes || '',
                updatedAt: serverTimestamp()
            };

            if (isNew) {
                await addDoc(collection(db, 'plans'), { ...data, createdAt: serverTimestamp() });
            } else {
                await updateDoc(doc(db, 'plans', selectedPlan.id), data);
            }
            setOpen(false);
        } catch (e) { alert("保存に失敗しました: " + e.message); }
    };

    const handleImmediateDelete = async (id) => {
        if (!id) return;
        try {
            await deleteDoc(doc(db, 'plans', id));
        } catch (e) { console.error(e); }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>プラン一覧</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>新規プラン追加</Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>プラン名</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>月次付与</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>繰越</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>備考</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {plans.map((plan) => (
                            <TableRow key={plan.id} hover>
                                <TableCell sx={{ fontWeight: 500 }}>{plan.name}</TableCell>
                                <TableCell align="right">{plan.monthlyPoints?.toLocaleString()} pt</TableCell>
                                <TableCell align="center">{plan.canCarryOver ? '可' : '不可'}</TableCell>
                                <TableCell sx={{ fontSize: '0.85rem', color: '#666' }}>{plan.notes || '-'}</TableCell>
                                <TableCell align="center">
                                    <Stack direction="row" spacing={1} justifyContent="center">
                                        <IconButton onClick={() => handleEdit(plan)}><EditIcon /></IconButton>
                                        <IconButton onClick={() => handleImmediateDelete(plan.id)}><DeleteIcon /></IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>{isNew ? '新規プラン追加' : 'プラン編集'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="プラン名" fullWidth value={selectedPlan.name} onChange={(e) => setSelectedPlan({...selectedPlan, name: e.target.value})} />
                        <TextField label="月次付与ポイント" type="number" fullWidth value={selectedPlan.monthlyPoints} onChange={(e) => setSelectedPlan({...selectedPlan, monthlyPoints: e.target.value})} />
                        <FormControlLabel 
                            control={<Switch checked={selectedPlan.canCarryOver} onChange={(e) => setSelectedPlan({...selectedPlan, canCarryOver: e.target.checked})} />}
                            label="繰越を許可する"
                        />
                        <TextField label="備考" fullWidth multiline rows={2} value={selectedPlan.notes} onChange={(e) => setSelectedPlan({...selectedPlan, notes: e.target.value})} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)}>キャンセル</Button>
                    <Button onClick={handleSave} variant="contained">保存する</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PlanList;
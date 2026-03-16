import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { db } from '../firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, CircularProgress, 
    Button, IconButton, Stack, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const WorksCatalog = () => {
    const { worksCatalog, loading } = useData();
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState({ name: '', category: '', points: 0, notes: '' });
    const [isNew, setIsNew] = useState(false);

    if (loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

    const handleOpenAdd = () => {
        setSelectedItem({ name: '', category: '', points: 0, notes: '' });
        setIsNew(true);
        setOpen(true);
    };

    const handleEdit = (item) => {
        setSelectedItem({ 
            id: item.id,
            name: item.name || '',
            category: item.category || '',
            points: item.points || 0,
            notes: item.notes || '' // 確定したフィールド名を使用
        });
        setIsNew(false);
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            const data = {
                name: selectedItem.name || '',
                category: selectedItem.category || '',
                points: Number(selectedItem.points) || 0,
                notes: selectedItem.notes || '',
                updatedAt: serverTimestamp()
            };

            if (isNew) {
                await addDoc(collection(db, 'worksCatalog'), {
                    ...data,
                    createdAt: serverTimestamp()
                });
            } else {
                await updateDoc(doc(db, 'worksCatalog', selectedItem.id), data);
            }
            setOpen(false);
        } catch (e) { alert("保存に失敗しました: " + e.message); }
    };

    const handleImmediateDelete = async (id) => {
        if (!id) return;
        try {
            // アラートなしで即時削除を実行
            await deleteDoc(doc(db, 'worksCatalog', id));
        } catch (e) {
            console.error("Delete Error:", e);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>制作物マスタ</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                    新規追加
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>カテゴリ</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>制作物名</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>ポイント</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>備考</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {worksCatalog.map((item) => (
                            <TableRow key={item.id} hover>
                                <TableCell>{item.category}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell align="right">{item.points} pt</TableCell>
                                <TableCell sx={{ fontSize: '0.85rem', color: '#666' }}>
                                    {item.notes || '-'}
                                </TableCell>
                                <TableCell align="center">
                                    <Stack direction="row" spacing={1} justifyContent="center">
                                        <IconButton onClick={() => handleEdit(item)} sx={{ color: '#757575' }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            onClick={() => handleImmediateDelete(item.id)} 
                                            sx={{ color: '#757575' }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>{isNew ? '制作物の新規追加' : '制作物情報の編集'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="名称" fullWidth value={selectedItem.name} onChange={(e) => setSelectedItem({...selectedItem, name: e.target.value})} />
                        <TextField label="カテゴリ" fullWidth value={selectedItem.category} onChange={(e) => setSelectedItem({...selectedItem, category: e.target.value})} />
                        <TextField label="ポイント" type="number" fullWidth value={selectedItem.points} onChange={(e) => setSelectedItem({...selectedItem, points: e.target.value})} />
                        <TextField label="備考" fullWidth multiline rows={2} value={selectedItem.notes} onChange={(e) => setSelectedItem({...selectedItem, notes: e.target.value})} />
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

export default WorksCatalog;
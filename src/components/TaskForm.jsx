import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useSnackbar } from 'notistack';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
    FormControl, InputLabel, Select, MenuItem, CircularProgress, Autocomplete, Box, Stack,
    Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { parseISO } from 'date-fns';

const TaskForm = ({ open, onClose, customerId, task }) => {
    const { addWork, updateWork, deleteWorkWithRefund, transactions, worksCatalog } = useData();
    const { enqueueSnackbar } = useSnackbar();
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isEditing = task != null;
    const originalTransactions = isEditing
        ? (transactions[customerId] || []).filter(transaction => (
            transaction.workId === task.id
            && transaction.type === 'consumption'
            && Number(transaction.points) < 0
        ))
        : [];
    const originalPoints = originalTransactions.length === 1
        ? Math.abs(Number(originalTransactions[0].points))
        : Number(task?.pointsUsed) === 0 && originalTransactions.length === 0
            ? 0
            : null;

    useEffect(() => {
        if (open) {
            const initialData = {
                name: '',
                status: '制作中',
                dateUsed: new Date().toISOString(),
                deliveryUrl: '',
                memo: '',
                pointsUsed: 0,
                category: '',
            };

            if (isEditing) {
                setFormData({
                    ...initialData,
                    ...task,
                    // 以前の notes フィールドがある場合も考慮して memo に統合
                    memo: task.memo || task.notes || '',
                });
            } else {
                setFormData(initialData);
            }
        }
    }, [task, isEditing, open]);

    // --- 【重要】現在の案件名(formData.name)と一致するカタログ項目を特定 ---
    const catalogValue = worksCatalog.find(option => option.name === formData.name) || null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (newDate) => {
        setFormData(prev => ({ 
            ...prev, 
            dateUsed: newDate ? newDate.toISOString() : new Date().toISOString() 
        }));
    };

    const handleCatalogSelect = (event, value) => {
        if (value) {
            setFormData(prev => ({
                ...prev,
                name: value.name || '',
                pointsUsed: value.points || 0,
                category: value.category || '',
                memo: value.notes || value.memo || prev.memo, // カタログの備考を反映
            }));
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.category) {
            enqueueSnackbar('案件名とカテゴリは必須です。', { variant: 'warning' });
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                pointsUsed: parseInt(formData.pointsUsed, 10) || 0,
            };

            if (isEditing) {
                await updateWork(task.id, payload);
                enqueueSnackbar('実績を更新しました', { variant: 'success' });
            } else {
                await addWork(customerId, payload);
                enqueueSnackbar('実績を追加しました', { variant: 'success' });
            }
            onClose();
        } catch (error) {
            console.error("Task submission failed:", error);
            enqueueSnackbar('処理に失敗しました。', { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteWorkWithRefund(customerId, task.id);
            setDeleteDialogOpen(false);
            enqueueSnackbar(
                result.refundPoints > 0
                    ? `制作実績を削除し、${result.refundPoints.toLocaleString()}ポイントを返還しました`
                    : '制作実績を削除しました',
                { variant: 'success' }
            );
            onClose();
        } catch (error) {
            console.error('Work deletion failed:', error);
            enqueueSnackbar(error.message || '制作実績の削除に失敗しました。', { variant: 'error' });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                {isEditing ? '制作実績の編集' : '新規制作実績追加'}
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ pt: 1 }}> 
                    <Stack spacing={3}>
                        <Autocomplete
                            options={worksCatalog}
                            getOptionLabel={(option) => `${option.name} (${option.points}pt)`}
                            // --- 【修正】現在の案件名と一致するものを初期選択状態にする ---
                            value={catalogValue}
                            onChange={handleCatalogSelect}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="制作物マスタから選択（任意）"
                                    helperText="制作物マスタを選択すると、案件名・カテゴリ・消費ポイントが自動入力されます。"
                                />
                            )}
                            disabled={isSubmitting}
                            // 一致判定の基準（名前が同じなら同じ選択肢とみなす）
                            isOptionEqualToValue={(option, value) => option.name === value?.name}
                        />

                        <TextField name="name" label="案件名" value={formData.name || ''} onChange={handleChange} fullWidth required disabled={isSubmitting} />

                        <Stack direction="row" spacing={2}>
                            <TextField name="category" label="カテゴリ" value={formData.category || ''} onChange={handleChange} fullWidth required disabled={isSubmitting} />
                            <TextField name="pointsUsed" label="消費ポイント" type="number" value={formData.pointsUsed || 0} onChange={handleChange} fullWidth required disabled={isSubmitting} />
                        </Stack>

                        <Stack direction="row" spacing={2}>
                            <FormControl fullWidth disabled={isSubmitting}>
                                <InputLabel>ステータス</InputLabel>
                                <Select name="status" value={formData.status || '制作中'} onChange={handleChange} label="ステータス">
                                    <MenuItem value="制作中">制作中</MenuItem>
                                    <MenuItem value="校了">校了</MenuItem>
                                </Select>
                            </FormControl>
                            <DatePicker
                                label="実施日"
                                value={formData.dateUsed ? parseISO(formData.dateUsed) : new Date()}
                                onChange={handleDateChange}
                                disabled={isSubmitting}
                                slotProps={{ textField: { fullWidth: true } }} 
                            />
                        </Stack>

                        <TextField name="deliveryUrl" label="納品URL" value={formData.deliveryUrl || ''} onChange={handleChange} fullWidth disabled={isSubmitting} placeholder="https://..." />
                        
                        <TextField name="memo" label="備考" value={formData.memo || ''} onChange={handleChange} fullWidth multiline rows={3} disabled={isSubmitting} />
                    </Stack>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                {isEditing && (
                    <Button
                        color="error"
                        variant="outlined"
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={isSubmitting || isDeleting}
                        sx={{ mr: 'auto' }}
                    >
                        削除する
                    </Button>
                )}
                <Button onClick={onClose} disabled={isSubmitting}>キャンセル</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
                    {isEditing ? '更新する' : '追加する'}
                </Button>
            </DialogActions>
            <Dialog open={deleteDialogOpen} onClose={() => !isDeleting && setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>制作実績の削除確認</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={1.5}>
                        <Typography>
                            この制作実績を削除します。使用済みポイントは取引履歴に返還記録を追加したうえで戻されます。この操作を実行しますか？
                        </Typography>
                        <Typography variant="body2"><strong>案件名：</strong>{task?.name || '名称未設定'}</Typography>
                        <Typography variant="body2">
                            <strong>元の消費ポイント：</strong>
                            {originalPoints == null ? '特定できません' : `${originalPoints.toLocaleString()} pt`}
                        </Typography>
                        <Typography variant="body2">
                            <strong>返還予定ポイント：</strong>
                            {originalPoints == null ? '確認できないため実行時に停止します' : `${originalPoints.toLocaleString()} pt`}
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>キャンセル</Button>
                    <Button color="error" variant="contained" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? <CircularProgress size={20} color="inherit" /> : '削除を実行する'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
};

export default TaskForm;

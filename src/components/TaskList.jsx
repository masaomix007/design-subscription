
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useSnackbar } from 'notistack';
import TaskForm from './TaskForm';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tooltip,
} from '@mui/material';
import { Add, Edit, Delete, CloudDownload } from '@mui/icons-material';
import { format } from 'date-fns';

const TaskList = ({ customerId }) => {
    const { role, tasks, deleteTask } = useData();
    const { enqueueSnackbar } = useSnackbar();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const handleOpenForm = (task) => {
        setSelectedTask(task);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setSelectedTask(null);
        setIsFormOpen(false);
    };

    const handleOpenConfirm = (task) => {
        setTaskToDelete(task);
        setIsConfirmOpen(true);
    };

    const handleCloseConfirm = () => {
        setTaskToDelete(null);
        setIsConfirmOpen(false);
    };

    const handleDelete = async () => {
        if (taskToDelete) {
            try {
                await deleteTask(customerId, taskToDelete.id);
                enqueueSnackbar('案件を削除しました', { variant: 'info' });
            } catch (error) {
                console.error("Failed to delete task: ", error);
                enqueueSnackbar('案件の削除に失敗しました', { variant: 'error' });
            }
        }
        handleCloseConfirm();
    };

    const getStatusChip = (status) => {
        return <Chip label={status} color={status === '完了' ? 'success' : 'secondary'} size="small" />;
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">作業状況リスト</Typography>
                {role === 'admin' && (
                    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenForm(null)}>
                        新規制作物追加
                    </Button>
                )}
            </Box>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>案件名</TableCell>
                            <TableCell>ステータス</TableCell>
                            <TableCell>完了予定日</TableCell>
                            <TableCell>納品物</TableCell>
                            {role === 'admin' && <TableCell align="right">操作</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell>{task.name}</TableCell>
                                <TableCell>{getStatusChip(task.status)}</TableCell>
                                <TableCell>{task.dueDate ? format(task.dueDate, 'yyyy/MM/dd') : '-'}</TableCell>
                                <TableCell>
                                    {task.status === '完了' && task.deliveryUrl ? (
                                        <Button 
                                            variant="contained" 
                                            color="success"
                                            size="small"
                                            startIcon={<CloudDownload />}
                                            href={task.deliveryUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            ダウンロード
                                        </Button>
                                    ) : '-'}
                                </TableCell>
                                {role === 'admin' && (
                                    <TableCell align="right">
                                        <Tooltip title="編集">
                                            <IconButton onClick={() => handleOpenForm(task)} size="small">
                                                <Edit />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="削除">
                                            <IconButton onClick={() => handleOpenConfirm(task)} size="small">
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TaskForm
                open={isFormOpen}
                onClose={handleCloseForm}
                customerId={customerId}
                task={selectedTask}
            />

            <Dialog open={isConfirmOpen} onClose={handleCloseConfirm}>
                <DialogTitle>案件の削除</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        案件「{taskToDelete?.name}」を本当に削除しますか？この操作は元に戻せません。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirm}>キャンセル</Button>
                    <Button onClick={handleDelete} color="error">削除</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default TaskList;

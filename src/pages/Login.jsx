import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useData } from '../contexts/DataContext';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    Backdrop // 全画面ローディングのために追加
} from '@mui/material';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false); // ログイン処理中の状態

    const navigate = useNavigate();
    const { user, currentUserCustomer, loading, authLoading } = useData();

    // ログイン後のリダイレクト処理
    useEffect(() => {
        // データ読み込み中、またはログイン処理中はリダイレクトしない
        if (authLoading || loading || isLoggingIn) return;

        if (user) {
            // 管理者の場合
            if (user.role === 'admin') {
                navigate('/dashboard');
            }
            // 顧客の場合 (対応する顧客情報が存在する)
            else if (user.role === 'customer' && currentUserCustomer) {
                navigate(`/customers/${currentUserCustomer.id}`);
            }
            // 顧客だが情報がまだない場合、loadingが終わるまで待機されるので、
            // このelseに来ることは少ないが、念のためダッシュボードへ
            else {
                 navigate('/dashboard');
            }
        }
    }, [user, currentUserCustomer, loading, authLoading, navigate, isLoggingIn]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setError('');
        const auth = getAuth();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // ログイン成功後はuseEffectがリダイレクトを処理するため、
            // ここでは isLoggingIn を false にせず、遷移を待つ
        } catch (err) {
            setError('ログインに失敗しました。メールアドレスまたはパスワードを確認してください。');
            setIsLoggingIn(false); // 失敗時のみローディングを解除
        }
    };
    
    // ログイン処理中やデータ読み込み中は全画面ローディングを表示
    if (isLoggingIn || authLoading || (user && loading)) {
        return (
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={true}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        );
    }

    return (
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', height: '100vh' }}>
            <Paper elevation={6} sx={{ p: 4, width: '100%' }}>
                <Typography component="h1" variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                    制作管理システム
                </Typography>
                <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="メールアドレス"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoggingIn}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="パスワード"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoggingIn}
                    />
                    <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isLoggingIn}
                            size="large"
                        >
                            ログイン
                        </Button>
                        {isLoggingIn && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px',
                                }}
                            />
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;

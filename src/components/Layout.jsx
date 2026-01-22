import React from 'react';
import { Box, Drawer, AppBar, Toolbar, List, Typography, ListItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import { 
    Dashboard as DashboardIcon, 
    People as PeopleIcon, 
    Assignment as AssignmentIcon, 
    Inventory as InventoryIcon, // 制作物マスタ用アイコン
    ExitToApp as ExitToAppIcon 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const drawerWidth = 240;

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    // ビデオや以前の構成に基づいたメニュー項目
    const menuItems = [
        { text: 'ダッシュボード', icon: <DashboardIcon />, path: '/dashboard' },
        { text: '顧客一覧', icon: <PeopleIcon />, path: '/customers' },
        { text: 'プラン一覧', icon: <AssignmentIcon />, path: '/plans' },
        { text: '制作物マスタ', icon: <InventoryIcon />, path: '/works-catalog' }, // ここを復活させました
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: 1201, bgcolor: '#1976d2' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        制作管理システム
                    </Typography>
                    <Button color="inherit" onClick={handleLogout} startIcon={<ExitToAppIcon />}>
                        ログアウト
                    </Button>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem 
                                button 
                                key={item.text} 
                                onClick={() => navigate(item.path)}
                                selected={location.pathname === item.path}
                                sx={{
                                    '&.Mui-selected': { bgcolor: 'rgba(25, 118, 210, 0.08)' },
                                    '&.Mui-selected:hover': { bgcolor: 'rgba(25, 118, 210, 0.12)' }
                                }}
                            >
                                <ListItemIcon sx={{ color: location.pathname === item.path ? '#1976d2' : 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.text} 
                                    primaryTypographyProps={{ 
                                        fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                                        color: location.pathname === item.path ? '#1976d2' : 'inherit'
                                    }} 
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

export default Layout;

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { DataProvider } from './contexts/DataContext';
import { SnackbarProvider } from 'notistack';
// Date PickerのためのProviderとAdapterをインポート
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
                {/* LocalizationProviderでラップし、日本語とdate-fnsを設定 */}
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                    <DataProvider>
                        <HashRouter>
                            <CssBaseline />
                            <App />
                        </HashRouter>
                    </DataProvider>
                </LocalizationProvider>
            </SnackbarProvider>
        </ThemeProvider>
    </React.StrictMode>
);

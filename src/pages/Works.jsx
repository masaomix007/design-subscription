
import React from 'react';
import { useData } from '../contexts/DataContext';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Box,
    Chip,
    Skeleton
} from '@mui/material';
import { format } from 'date-fns';

const Works = () => {
    const { publishedWorks, customers, loading } = useData();

    const getCustomerName = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        return customer ? customer.name : '不明な顧客';
    };

    const renderSkeletons = () => {
        return (
            <Grid container spacing={3}>
                {Array.from(new Array(6)).map((_, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Skeleton variant="rectangular" height={120} />
                        <Box sx={{ pt: 0.5 }}>
                            <Skeleton />
                            <Skeleton width="60%" />
                        </Box>
                    </Grid>
                ))}
            </Grid>
        );
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4, mb: 4 }}>
                制作実績
            </Typography>
            {loading ? renderSkeletons() : (
                <Grid container spacing={4}>
                    {publishedWorks.map((work) => (
                        <Grid item xs={12} sm={6} md={4} key={work.id}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography gutterBottom variant="h6" component="div">
                                        {work.name}
                                    </Typography>
                                    <Chip label={work.category} size="small" sx={{ mb: 1 }}/>
                                    <Typography variant="body2" color="text.secondary">
                                       顧客: {getCustomerName(work.customerId)} 
                                    </Typography>
                                    {work.completedAt && (
                                         <Typography variant="body2" color="text.secondary">
                                            完了日: {format(new Date(work.completedAt), 'yyyy年MM月dd日')}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default Works;

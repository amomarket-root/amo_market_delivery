import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Paper, Typography, Skeleton, Alert, Box } from '@mui/material';

const DeliveryMetricsPage = () => {
  const [data, setData] = useState({
    total_orders: 0,
    today_orders: 0,
    today_income: 0,
    last_7_days_orders: 0,
    last_7_days_income: 0,
    last_month_orders: 0,
    last_month_income: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL;
  const delivery_token = localStorage.getItem('delivery_token');

  // Memoize fetchData so it doesn't get recreated on every render
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiUrl}/delivery/orders_metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${delivery_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setData({
        total_orders: Number(result.total_orders) || 0,
        today_orders: Number(result.today_orders) || 0,
        today_income: Number(result.today_income) || 0,
        last_7_days_orders: Number(result.last_7_days_orders) || 0,
        last_7_days_income: Number(result.last_7_days_income) || 0,
        last_month_orders: Number(result.last_month_orders) || 0,
        last_month_income: Number(result.last_month_income) || 0,
      });
    } catch (err) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, delivery_token]); // Dependencies required for useCallback

  useEffect(() => {
    if (delivery_token) {
      fetchData();
    }
  }, [fetchData, delivery_token]); // Now fetchData is stable and safe to use

  return (
    <Grid item xs={12}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" sx={{ fontWeight: 'bold' }} gutterBottom>
          Delivery Metrics
        </Typography>
      </Box>
      {error ? (
        <Grid container item xs={12} spacing={3} justifyContent="center">
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        </Grid>
      ) : (
        <Grid container item xs={12} spacing={3} justifyContent="center">
          {[
            { title: 'Total Orders', value: data.total_orders, imgSrc: '/image/total_orders.webp' },
            { title: "Today's Orders", value: data.today_orders, imgSrc: '/image/today_orders.webp' },
            { title: "Today's Income", value: `₹${Number(data.today_income).toFixed(2)}`, imgSrc: '/image/today_income.webp' },
            { title: 'Last 7 Days Orders', value: data.last_7_days_orders, imgSrc: '/image/last_7_days_orders.webp' },
            { title: 'Last 7 Days Income', value: `₹${Number(data.last_7_days_income).toFixed(2)}`, imgSrc: '/image/last_7_days_income.webp' },
            { title: 'Last Month Orders', value: data.last_month_orders, imgSrc: '/image/last_month_orders.webp' },
            { title: 'Last Month Income', value: `₹${Number(data.last_month_income).toFixed(2)}`, imgSrc: '/image/last_month_income.webp' },
          ].map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper elevation={10} style={{ padding: 15, height: '80%', display: 'flex', flexDirection: 'column', borderRadius: 10 }}>
                {loading ? (
                  <Skeleton variant="rectangular" width={100} height={100} style={{ borderRadius: '5px' }} />
                ) : (
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={5} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <img src={card.imgSrc} alt={card.title} style={{ maxWidth: '100%', height: 'auto' }} loading="eager" decoding="async"/>
                    </Grid>
                    <Grid item xs={7} container direction="column" justifyContent="flex-start" alignItems="flex-start">
                      <Typography variant="body1">{card.title}</Typography>
                      <Typography style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '2rem', width: '100%' }}>
                        {card.value}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Grid>
  );
};

export default DeliveryMetricsPage;

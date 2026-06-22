import api from './axiosInstance';

export const checkout = (plan = 'pro') =>
  api.post('/subscription/checkout', { plan });

export const getStatus = () =>
  api.get('/subscription/status');

export const cancelSubscription =(invoiceId)=>
  api.post(`/invoices/${invoiceId}/cancel`, { invoiceId });

export const retrySubscription = (invoiceId) =>
  api.post(`/invoices/${invoiceId}/retry`, { invoiceId });

export const getInvoices = () =>
  api.get('/invoices');

export const getInvoice = (invoiceId) =>
  api.get(`/invoices/${invoiceId}`);

export const getInvoiceStatus = (invoiceId) =>
  api.get(`/invoices/${invoiceId}/status`);

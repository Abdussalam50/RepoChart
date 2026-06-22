import api from './axiosInstance';

export const getClients = () =>
  api.get('/clients');                            // GET    /api/clients

export const getClient = (id) =>
  api.get(`/clients/${id}`);                     // GET    /api/clients/:id

export const createClient = (data) =>
  api.post('/clients', data);                    // POST   /api/clients

export const updateClient = (id, data) =>
  api.put(`/clients/${id}`, data);               // PUT    /api/clients/:id

export const deleteClient = (id) =>
  api.delete(`/clients/${id}`);                  // DELETE /api/clients/:id

export const uploadClientLogo = (id, file) => {
  const form = new FormData();
  form.append('logo', file);
  return api.post(`/clients/${id}/logo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });                                             // POST   /api/clients/:id/logo
};

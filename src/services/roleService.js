import axios from '../lib/axios';

export async function getRoles({ page = 1, search = '' } = {}) {
  const res = await axios.get('/roles', {
    params: { page, search }
  });
  return res.data;
}

export async function createRole({ name, description }) {
  const res = await axios.post('/roles', { name, description });
  return res.data;
}

export async function updateRole({ id, name, description }) {
  const res = await axios.put(`/roles/${id}`, { name, description });
  return res.data;
}

export async function deleteRole(roleId) {
  return axios.delete(`/roles/${roleId}`);
}

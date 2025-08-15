"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { selectCompany } from '@/services/authService';
import { registerCompany } from '@/services/companyService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from '@/lib/axios';
import { Edit3, Copy } from 'lucide-react';

export default function SelectCompanyPage() {
  const { user, availableCompanies, setCompany, setUser, setAvailableCompanies } = useUserStore();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newCompany, setNewCompany] = useState({ name: '', email: '', phone: '', address: '' });
  // Eliminado inline rename; solo modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalCompany, setEditModalCompany] = useState(null);
  const [editModalData, setEditModalData] = useState({ company_name: '', email: '', phone: '', address: '' });
  const [editModalSaving, setEditModalSaving] = useState(false);
  const [editModalError, setEditModalError] = useState('');
  const router = useRouter();
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [cloneSource, setCloneSource] = useState(null);
  const [cloneData, setCloneData] = useState({ copy_name: '' });
  const [cloning, setCloning] = useState(false);
  const [cloneError, setCloneError] = useState('');

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  // Cargar roles reales del usuario en cada company consultando el endpoint /users con header x-company-code
  useEffect(() => {
    const fetchRoles = async () => {
      if (!user || !availableCompanies.length) return;
      try {
        const updated = await Promise.all(availableCompanies.map(async (comp) => {
          try {
            // Consultar usuarios del schema de la compañía
            const resp = await axios.get('/users', { headers: { 'x-company-code': comp.company_code }});
            const match = Array.isArray(resp.data) ? resp.data.find(u => u.email === user.email) : null;
            if (match) {
              const roleNames = (match.roles || []).map(r => r.name || r).filter(Boolean);
              return { ...comp, roles: roleNames };
            }
          } catch (err) {
            console.warn('No se pudieron obtener roles para company', comp.company_code, err?.response?.status);
          }
          return comp; // fallback sin cambios
        }));
        setAvailableCompanies(updated);
      } catch (err) {
        console.error('Error obteniendo roles multi-schema', err);
      }
    };
    fetchRoles();
    // Solo una vez al cargar lista de compañías o cambio de usuario
  }, [user, /* eslint-disable-line react-hooks/exhaustive-deps */ availableCompanies.length]);

  const handleSelect = async (code) => {
    try {
      const resp = await selectCompany(code);
      if (resp?.user) {
        setUser(resp.user); // contiene company anidada
        setCompany(resp.user.company);
        router.replace('/modules');
      }
    } catch (e) {
      console.error('Error seleccionando empresa', e);
      // TODO: mostrar feedback
    }
  };

  const slugify = (txt) => txt.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,30);
  const buildDefaultEmail = () => {
    if (!user?.email) return '';
    const domain = user.email.split('@')[1] || 'example.com';
    return `${slugify(newCompany.name || 'empresa')}-${Date.now().toString().slice(-4)}@${domain}`;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCompany.name.trim()) {
      setCreateError('Nombre de empresa requerido');
      return;
    }
    setCreating(true);
    setCreateError('');
    try {
      const companyEmail = (newCompany.email || buildDefaultEmail()).trim();
      const payload = {
        company_name: newCompany.name.trim(),
        email: companyEmail,
        phone: newCompany.phone || null,
        address: newCompany.address || null,
        admin_name: user.name,
        admin_email: user.email,
        admin_password: `${Math.random().toString(36).slice(2,10)}Aa!` // contraseña temporal
      };
      const resp = await registerCompany(payload);
      if (resp?.success && resp.data?.company_code) {
        const newEntry = {
          company_id: resp.data.company_id,
          company_code: resp.data.company_code,
          company_name: newCompany.name.trim(),
          schema_name: resp.data.schema_name,
          roles: ['admin']
        };
        setAvailableCompanies([...availableCompanies, newEntry]);
        setShowCreate(false);
        setNewCompany({ name: '', email: '', phone: '', address: '' });
        // Seleccionar inmediatamente la nueva empresa
        await handleSelect(resp.data.company_code);
      } else {
        setCreateError(resp?.message || 'No se pudo crear la empresa');
      }
    } catch (err) {
      setCreateError(err?.response?.data?.error || err?.message || 'Error al crear empresa');
    } finally {
      setCreating(false);
    }
  };

  // Inline rename eliminado

  const [editModalLoading, setEditModalLoading] = useState(false);
  const openFullEdit = async (company) => {
    setEditModalCompany(company);
    setEditModalError('');
    setEditModalOpen(true);
    setEditModalLoading(true);
    try {
      // Obtener datos completos por código (ruta pública)
      const resp = await axios.get(`/companies/code/${company.company_code}`);
      if (resp?.data?.data) {
        const d = resp.data.data;
        setEditModalData({
          company_name: d.company_name || company.company_name || '',
            email: d.email || d.company_email || '',
            phone: d.phone || '',
            address: d.address || ''
        });
      } else {
        // fallback a datos básicos
        setEditModalData({
          company_name: company.company_name || '',
          email: company.email || '',
          phone: company.phone || '',
          address: company.address || ''
        });
      }
    } catch (err) {
      console.warn('No se pudo cargar datos completos de la empresa', err);
      setEditModalData({
        company_name: company.company_name || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || ''
      });
    } finally {
      setEditModalLoading(false);
    }
  };

  const closeFullEdit = () => {
    setEditModalOpen(false);
    setEditModalCompany(null);
    setEditModalError('');
  };

  const handleFullEditSave = async (e) => {
    e.preventDefault();
    if (!editModalCompany) return;
    if (!editModalData.company_name.trim()) {
      setEditModalError('El nombre es requerido');
      return;
    }
    setEditModalSaving(true);
    setEditModalError('');
    try {
      const payload = { ...editModalData };
      // Limpiar strings vacíos a null
      ['email','phone','address'].forEach(k => { if (payload[k] === '') payload[k] = null; });
      await axios.put(`/companies/${editModalCompany.company_id}`, payload);
      setAvailableCompanies(availableCompanies.map(c => c.company_id === editModalCompany.company_id ? { ...c, ...payload } : c));
      closeFullEdit();
    } catch (err) {
      console.error('Error guardando cambios empresa', err);
      setEditModalError(err?.response?.data?.error || err.message || 'Error al guardar');
    } finally {
      setEditModalSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-[clamp(320px,90vw,clamp(500px,60vw,800px))] flex flex-col items-center justify-center px-4 py-[clamp(20px,10vh,100px)] mx-auto">
      <h1 className="text-5xl font-black mb-8 self-start">ERPLOGO</h1>
      <div className="bg-background w-full flex-1 rounded-lg gap-6 p-6 flex flex-col">
        <h2 className="text-3xl leading-none font-black">Proyectos</h2>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Tus proyectos</h3>
            <Button size="sm" onClick={() => setShowCreate(v=>!v)} variant={showCreate? 'secondary':'default'}>
              {showCreate ? 'Cancelar' : 'Nuevo Proyecto' }
            </Button>
          </div>

          {showCreate && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                <h4 className="text-xl font-bold mb-4">Crear nuevo Proyecto</h4>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <Label className="text-xs uppercase font-semibold">Nombre</Label>
                    <Input value={newCompany.name} onChange={e=>setNewCompany(v=>({...v,name:e.target.value}))} placeholder="Mi Empresa" disabled={creating} />
                  </div>
                  <div>
                    <Label className="text-xs uppercase font-semibold flex justify-between items-center">Email de Empresa <span className="font-normal text-[10px] text-muted-foreground">(único)</span></Label>
                    <Input value={newCompany.email} onChange={e=>setNewCompany(v=>({...v,email:e.target.value}))} placeholder={buildDefaultEmail()} disabled={creating} />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label className="text-xs uppercase font-semibold">Teléfono</Label>
                      <Input value={newCompany.phone} onChange={e=>setNewCompany(v=>({...v,phone:e.target.value}))} placeholder="Opcional" disabled={creating} />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs uppercase font-semibold">Dirección</Label>
                      <Input value={newCompany.address} onChange={e=>setNewCompany(v=>({...v,address:e.target.value}))} placeholder="Opcional" disabled={creating} />
                    </div>
                  </div>
                  {createError && <div className="text-xs text-red-600">{createError}</div>}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" disabled={creating} onClick={()=>{setShowCreate(false); setCreateError('');}}>Cancelar</Button>
                    <Button type="submit" disabled={creating}>{creating? 'Creando...':'Crear Empresa'}</Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Serás administrador de este nuevo proyecto.</p>
                </form>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {availableCompanies.map(c => {
              const userRoles = user?.roles || [];
              const companyRoles = Array.isArray(c.roles) ? c.roles : [];
              const mergedRoles = [...new Set([...userRoles, ...companyRoles.map(r => typeof r === 'string' ? r : r.name)])];
              const isAdmin = mergedRoles.some(r => ['admin','super_admin','Super Administrador','Owner','Administrador'].includes(r));
              return (
                <Card key={c.company_code} className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium cursor-pointer" onClick={() => handleSelect(c.company_code)}>{c.company_name}</span>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleSelect(c.company_code)}>Entrar</Button>
                        {isAdmin && (
                          <Button size="icon" variant="ghost" onClick={() => openFullEdit(c)} title="Editar detalles">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button size="icon" variant="ghost" onClick={()=>{setCloneSource(c); setCloneData({ copy_name: c.company_name + ' Copia' }); setCloneError(''); setCloneModalOpen(true);}} title="Duplicar proyecto">
                            <Copy className="w-4 h-4" />
                            <span className="sr-only">Duplicar</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
            {availableCompanies.length === 0 && (
              <div className="text-sm text-muted-foreground">No hay compañías disponibles. Crea tu primera.</div>
            )}
          </div>
        </div>
      </div>
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
            <h4 className="text-xl font-bold mb-4">Editar Empresa</h4>
            <form onSubmit={handleFullEditSave} className="space-y-4">
              <div>
                <Label className="text-xs uppercase font-semibold">Nombre</Label>
                <Input value={editModalData.company_name} onChange={e=>setEditModalData(v=>({...v,company_name:e.target.value}))} disabled={editModalSaving} />
              </div>
              <div>
                <Label className="text-xs uppercase font-semibold">Email</Label>
                <Input value={editModalData.email || ''} onChange={e=>setEditModalData(v=>({...v,email:e.target.value}))} disabled={editModalSaving} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-xs uppercase font-semibold">Teléfono</Label>
                  <Input value={editModalData.phone || ''} onChange={e=>setEditModalData(v=>({...v,phone:e.target.value}))} disabled={editModalSaving} />
                </div>
                <div className="flex-1">
                  <Label className="text-xs uppercase font-semibold">Dirección</Label>
                  <Input value={editModalData.address || ''} onChange={e=>setEditModalData(v=>({...v,address:e.target.value}))} disabled={editModalSaving} />
                </div>
              </div>
              {editModalError && <div className="text-xs text-red-600">{editModalError}</div>}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeFullEdit} disabled={editModalSaving}>Cancelar</Button>
                <Button type="submit" disabled={editModalSaving}>{editModalSaving? 'Guardando...':'Guardar Cambios'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {cloneModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
            <h4 className="text-xl font-bold mb-4">Duplicar Proyecto</h4>
            <form onSubmit={async (e)=>{
              e.preventDefault();
              if (!cloneSource) return;
              if (!cloneData.copy_name.trim()) { setCloneError('Nombre requerido'); return; }
              setCloning(true); setCloneError('');
              try {
                const resp = await axios.post('/companies/clone', {
                  source_code: cloneSource.company_code,
                  copy_name: cloneData.copy_name.trim()
                });
                if (resp.data?.success) {
                  // Agregar a la lista
                  setAvailableCompanies([...availableCompanies, {
                    company_id: resp.data.data.id,
                    company_code: resp.data.data.company_code,
                    company_name: resp.data.data.company_name || cloneData.copy_name.trim(),
                    schema_name: resp.data.data.schema_name,
                    roles: ['admin']
                  }]);
                  setCloneModalOpen(false);
                  setCloneSource(null);
                  setCloneData({ copy_name: '' });
                } else {
                  setCloneError(resp.data?.error || 'No se pudo clonar');
                }
              } catch (err) {
                setCloneError(err?.response?.data?.error || err.message || 'Error al clonar');
              } finally {
                setCloning(false);
              }
            }} className="space-y-4">
              <div>
                <Label className="text-xs uppercase font-semibold">Nombre de la Copia</Label>
                <Input value={cloneData.copy_name} onChange={e=>setCloneData(v=>({...v,copy_name:e.target.value}))} disabled={cloning} />
              </div>
              {cloneError && <div className="text-xs text-red-600">{cloneError}</div>}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" disabled={cloning} onClick={()=>{setCloneModalOpen(false); setCloneSource(null);}}>Cancelar</Button>
                <Button type="submit" disabled={cloning}>{cloning? 'Clonando...':'Duplicar'}</Button>
              </div>
              <p className="text-[11px] text-muted-foreground">Se copiarán todos los datos del proyecto original.</p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

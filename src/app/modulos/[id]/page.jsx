// app/modules/[id]/page.jsx (o .tsx si usas TypeScript)

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getModuleById } from '@/services/moduleService'; 
import Loader from '@/components/Loader'; 
import StatusBadge from '@/components/ModuleStatusBadge';
import { useModules } from '@/hooks/useModules';
import Table from '@/components/Table';


export default function ModuleDetailPage() {

  const {
    modules,
    getById,
  } = useModules();

  const { id } = useParams();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);

  const columns = [
  { key: 'name', header: 'Nombre' },
  { key: 'quantity', header: 'Cantidad' },
  { key: 'location', header: 'Ubicación' },
];

  const data = [
    { id: 1, name: 'Monitor', quantity: 15, location: 'Almacén A' },
    { id: 2, name: 'Teclado', quantity: 30, location: 'Almacén B' },
    { id: 2, name: 'Teclado', quantity: 30, location: 'Almacén B' },
    { id: 2, name: 'Teclado', quantity: 30, location: 'Almacén B' },
    
  ];

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const data = await getById(id);
        setModule(data);
      } catch (error) {
        console.error('Error fetching module:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [id]);

  if (loading) return <Loader text="Cargando módulo..." />;
  if (!module) return <p>No se encontró el módulo con ID {id}.</p>;

  return (
    <div className="module-detail-page">
      <p><strong>Descripción:</strong> {module.description || 'Sin descripción'}</p>
      <p><strong>Categoría:</strong> {module.category || 'Sin categoría'}</p>
      <div>
        <h1>{module.name}</h1>
        <Table columns={columns} data={data} />
      </div>

      <style jsx>{`
        .module-detail-page {
          max-width: 100%;
          margin: 2rem auto;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .module-icon {
          width: 64px;
          height: 64px;
          object-fit: contain;
          margin-bottom: 1rem;
        }

        h1 {
          font-size: 1.5rem;
          color: #111827;
          margin-bottom: 1rem;
        }

        p {
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

// 1. Extender la interfaz de props para aceptar todos los campos del bloque
interface EditBlockDialogProps {
  trigger: React.ReactNode;
  block: {
    id: string;
    nombre_actividad: string;
    dias: string[];
    hora_inicio: string;
    hora_fin: string;
    ubicacion?: string | null;
    requiere_recordatorio?: boolean;
    es_inflexible?: boolean;
    bloque_tipo: 'fijo' | 'básico' | 'personal';
    estado: 'activo' | 'pausado_temporalmente';
    category_id: string | null;
  };
  onBlockUpdated?: () => void;
  updateBlock: (id: string, updates: any) => Promise<any>;
}

// 2. Agregar estados para todos los campos editables
export const EditBlockDialog = ({ trigger, block, onBlockUpdated, updateBlock }: EditBlockDialogProps) => {
  const [open, setOpen] = useState(false);
  const [nombreActividad, setNombreActividad] = useState(block.nombre_actividad);
  const [dias, setDias] = useState<string[]>(block.dias);
  const [horaInicio, setHoraInicio] = useState(block.hora_inicio.slice(0,5));
  const [horaFin, setHoraFin] = useState(block.hora_fin.slice(0,5));
  const [ubicacion, setUbicacion] = useState(block.ubicacion || '');
  const [requiereRecordatorio, setRequiereRecordatorio] = useState(!!block.requiere_recordatorio);
  const [esInflexible, setEsInflexible] = useState(!!block.es_inflexible);
  const [bloqueTipo, setBloqueTipo] = useState(block.bloque_tipo);
  const [estado, setEstado] = useState(block.estado);
  const [categoryId, setCategoryId] = useState<string | null>(block.category_id ?? null);
  const { categories, loading: loadingCategories } = useCategories();
  const [loading, setLoading] = useState(false);

  const DIAS = [
    { key: 'L', label: 'Lunes' },
    { key: 'M', label: 'Martes' },
    { key: 'X', label: 'Miércoles' },
    { key: 'J', label: 'Jueves' },
    { key: 'V', label: 'Viernes' },
    { key: 'S', label: 'Sábado' },
    { key: 'D', label: 'Domingo' },
  ];

  const handleDiaToggle = (key: string) => {
    setDias(prev => prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateBlock(block.id, {
        nombre_actividad: nombreActividad,
        dias,
        hora_inicio: horaInicio + ':00',
        hora_fin: horaFin + ':00',
        ubicacion: ubicacion || null,
        requiere_recordatorio: requiereRecordatorio,
        es_inflexible: esInflexible,
        bloque_tipo: bloqueTipo,
        estado,
        category_id: categoryId === 'none' ? null : categoryId,
      });
      toast({ title: 'Bloque actualizado', description: 'Los cambios han sido guardados.' });
      setOpen(false);
      onBlockUpdated?.();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el bloque', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Bloque</DialogTitle>
          <DialogDescription>
            Modifica los datos de este bloque de rutina base.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <input className="w-full border rounded px-2 py-1" value={nombreActividad} onChange={e => setNombreActividad(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Días</Label>
            <div className="flex flex-wrap gap-2">
              {DIAS.map(dia => (
                <button type="button" key={dia.key} className={`px-2 py-1 rounded border ${dias.includes(dia.key) ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`} onClick={() => handleDiaToggle(dia.key)}>
                  {dia.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hora inicio</Label>
              <input type="time" className="w-full border rounded px-2 py-1" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Hora fin</Label>
              <input type="time" className="w-full border rounded px-2 py-1" value={horaFin} onChange={e => setHoraFin(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ubicación</Label>
            <input className="w-full border rounded px-2 py-1" value={ubicacion} onChange={e => setUbicacion(e.target.value)} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={requiereRecordatorio} onChange={e => setRequiereRecordatorio(e.target.checked)} /> Recordatorio
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={esInflexible} onChange={e => setEsInflexible(e.target.checked)} /> Inflexible
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={bloqueTipo} onValueChange={v => setBloqueTipo(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fijo">Fijo</SelectItem>
                  <SelectItem value="básico">Básico</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={estado} onValueChange={v => setEstado(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="pausado_temporalmente">Pausado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={categoryId ?? 'none'} onValueChange={v => setCategoryId(v === 'none' ? null : v)}>
              <SelectTrigger>
                <SelectValue placeholder={loadingCategories ? 'Cargando...' : 'Sin categoría'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin categoría</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="inline-flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                      <span>{cat.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 
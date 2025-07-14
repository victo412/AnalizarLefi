import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Tag, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useBlocks } from '@/hooks/useBlocks';
import { toast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';

interface CreateBlockDialogProps {
  trigger?: React.ReactNode;
  onBlockCreated?: () => void;
}

const TIER_OPTIONS = [
  { value: 1, label: 'Alta Prioridad', color: 'bg-red-500' },
  { value: 2, label: 'Media Prioridad', color: 'bg-yellow-500' },
  { value: 3, label: 'Baja Prioridad', color: 'bg-green-500' },
];

const COLOR_OPTIONS = [
  { value: '#3b82f6', label: 'Azul', class: 'bg-blue-500' },
  { value: '#10b981', label: 'Verde', class: 'bg-green-500' },
  { value: '#f59e0b', label: 'Amarillo', class: 'bg-yellow-500' },
  { value: '#ef4444', label: 'Rojo', class: 'bg-red-500' },
  { value: '#8b5cf6', label: 'Morado', class: 'bg-purple-500' },
  { value: '#06b6d4', label: 'Cian', class: 'bg-cyan-500' },
];

const ICON_OPTIONS = [
  { value: 'calendar', label: 'Calendario' },
  { value: 'clock', label: 'Reloj' },
  { value: 'tag', label: 'Etiqueta' },
  { value: 'star', label: 'Estrella' },
  { value: 'heart', label: 'Corazón' },
  { value: 'coffee', label: 'Café' },
  { value: 'book', label: 'Libro' },
  { value: 'music', label: 'Música' },
];

export const CreateBlockDialog = ({ trigger, onBlockCreated }: CreateBlockDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [tier, setTier] = useState<number>(2);
  const [icon, setIcon] = useState('calendar');
  const [loading, setLoading] = useState(false);
  const { categories, loading: loadingCategories } = useCategories();
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // Selecciona la primera categoría por defecto si existe
  useEffect(() => {
    if (categories && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories]);

  const { createBlock } = useBlocks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !startTime || !endTime) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa título, hora inicio y hora fin",
        variant: "destructive",
      });
      return;
    }

    // Validate time range
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    
    if (start >= end) {
      toast({
        title: "Horario inválido",
        description: "La hora de fin debe ser posterior a la hora de inicio",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create timestamps for today
      const today = new Date();
      const startDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 
        parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]));
      const endDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 
        parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]));

      await createBlock({
        title: title.trim(),
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        tier,
        icon,
        status: 'pending',
        source: 'manual',
        category_id: categoryId || undefined,
      });

      toast({
        title: "¡Bloque creado! 🎯",
        description: `"${title}" añadido al timeline`,
      });

      // Reset form
      setTitle('');
      setStartTime('');
      setEndTime('');
      setTier(2);
      setIcon('calendar');
      setCategoryId(null);
      setOpen(false);
      
      onBlockCreated?.();
    } catch (error) {
      console.error('Error creating block:', error);
      toast({
        title: "Error al crear bloque",
        description: "No se pudo crear el bloque. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button size="sm" className="flex items-center space-x-2">
      <Plus className="h-4 w-4" />
      <span>Nuevo Bloque</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Crear Nuevo Bloque</span>
          </DialogTitle>
          <DialogDescription>
            Añade una nueva tarea o actividad a tu timeline diario
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ej: Reunión con equipo, Ejercicio matutino..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Hora Inicio *</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">Hora Fin *</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prioridad</Label>
            <Select value={tier.toString()} onValueChange={(value) => setTier(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${option.color}`} />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Icono</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((iconOption) => (
                  <SelectItem key={iconOption.value} value={iconOption.value}>
                    {iconOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selector de categoría */}
          <div className="space-y-2">
            <Label>Categoría *</Label>
            <Select
              value={categoryId ?? (categories[0]?.id ?? "")}
              onValueChange={setCategoryId}
              disabled={categories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                      <span>{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categories.length === 0 && (
              <p className="text-xs text-destructive mt-1">Debes crear una categoría antes de añadir bloques.</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Bloque"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
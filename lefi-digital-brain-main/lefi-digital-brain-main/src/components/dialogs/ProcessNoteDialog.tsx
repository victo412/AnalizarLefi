import { useState } from 'react';
import { Calendar, Clock, Palette, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useBlocks } from '@/hooks/useBlocks';
import { useInbox } from '@/hooks/useInbox';

interface ProcessNoteDialogProps {
  trigger: React.ReactNode;
  noteId: string;
  noteContent: string;
  onProcessed: () => void;
}

export const ProcessNoteDialog = ({ trigger, noteId, noteContent, onProcessed }: ProcessNoteDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(noteContent.slice(0, 50) + (noteContent.length > 50 ? '...' : ''));
  const [description, setDescription] = useState(noteContent);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [tier, setTier] = useState('2');
  const [color, setColor] = useState('blue');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createBlock } = useBlocks();
  const { deleteNote } = useInbox();

  const colors = [
    { name: 'Azul', value: 'blue', class: 'bg-blue-500' },
    { name: 'Verde', value: 'green', class: 'bg-green-500' },
    { name: 'Amarillo', value: 'yellow', class: 'bg-yellow-500' },
    { name: 'Rojo', value: 'red', class: 'bg-red-500' },
    { name: 'Púrpura', value: 'purple', class: 'bg-purple-500' },
    { name: 'Rosa', value: 'pink', class: 'bg-pink-500' },
    { name: 'Naranja', value: 'orange', class: 'bg-orange-500' },
    { name: 'Gris', value: 'gray', class: 'bg-gray-500' },
  ];

  const tiers = [
    { name: 'Baja', value: '1', description: 'Prioridad baja' },
    { name: 'Media', value: '2', description: 'Prioridad media' },
    { name: 'Alta', value: '3', description: 'Prioridad alta' },
    { name: 'Urgente', value: '4', description: 'Prioridad urgente' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !startTime || !endTime) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    if (startTime >= endTime) {
      toast({
        title: "Error",
        description: "La hora de fin debe ser posterior a la hora de inicio",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const startDateTime = new Date(`${today}T${startTime}`);
      const endDateTime = new Date(`${today}T${endTime}`);

      const block = await createBlock({
        title: title.trim(),
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        tier: parseInt(tier),
        color,
        source: 'processed_note'
      });

      if (block) {
        // Eliminar la nota del inbox
        await deleteNote(noteId);
        
        setOpen(false);
        onProcessed();
        
        toast({
          title: "¡Bloque creado!",
          description: "La nota se ha convertido en un bloque del timeline",
        });
      }
    } catch (error) {
      console.error('Error al procesar nota:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la nota",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateDefaultTimes = () => {
    const now = new Date();
    const startHour = now.getHours() + 1;
    const endHour = startHour + 1;
    
    setStartTime(`${startHour.toString().padStart(2, '0')}:00`);
    setEndTime(`${endHour.toString().padStart(2, '0')}:00`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div onClick={generateDefaultTimes}>
          {trigger}
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[95vw] max-w-[500px] mx-2">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Procesar Nota</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Convierte esta nota en un bloque del timeline
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Reunión con equipo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles adicionales..."
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Hora inicio *</span>
              </Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Hora fin *</span>
              </Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center space-x-1">
              <Tag className="h-4 w-4" />
              <span>Prioridad</span>
            </Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiers.map((tierOption) => (
                  <SelectItem key={tierOption.value} value={tierOption.value}>
                    <div className="flex items-center space-x-2">
                      <span>{tierOption.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {tierOption.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center space-x-1">
              <Palette className="h-4 w-4" />
              <span>Color</span>
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${color === colorOption.value 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-transparent hover:border-muted-foreground/20'
                    }
                  `}
                >
                  <div className={`w-full h-6 rounded ${colorOption.class}`} />
                  <span className="text-xs mt-1 block">{colorOption.name}</span>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Crear Bloque'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
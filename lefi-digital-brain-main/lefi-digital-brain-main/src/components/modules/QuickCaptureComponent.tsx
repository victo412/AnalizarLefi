import { useState } from 'react';
import { Mic, Type, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useInbox } from '@/hooks/useInbox';
import { toast } from '@/hooks/use-toast';

interface QuickCaptureComponentProps {
  onNoteCreated?: () => void;
}

export const QuickCaptureComponent = ({ onNoteCreated }: QuickCaptureComponentProps) => {
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createNote } = useInbox();

  const handleSubmit = async () => {
    if (!note.trim()) return;

    setIsLoading(true);
    try {
      const success = await createNote({
        content: note.trim(),
        type: 'text',
        source: 'planner_quick_capture'
      });

      if (success) {
        setNote('');
        onNoteCreated?.();
        toast({
          title: "¡Nota capturada!",
          description: "Tu nota se ha enviado al inbox para procesar",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo capturar la nota",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-sm flex items-center space-x-2">
          <Type className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Captura Rápida</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        <Textarea
          placeholder="Escribe tu nota aquí... (Ctrl/Cmd + Enter para enviar)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[60px] sm:min-h-[80px] resize-none text-sm"
          disabled={isLoading}
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit}
            disabled={!note.trim() || isLoading}
            size="sm"
            className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
          >
            <Send className="h-3 w-3" />
            <span>{isLoading ? 'Enviando...' : 'Capturar'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
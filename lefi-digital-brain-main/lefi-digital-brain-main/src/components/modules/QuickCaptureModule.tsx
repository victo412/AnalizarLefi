
import { useState, useRef } from 'react';
import { Mic, MicOff, Type, Send, Trash2, Edit3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useInbox } from '@/hooks/useInbox';
import { ProcessNoteDialog } from '@/components/dialogs/ProcessNoteDialog';

interface QuickCaptureModuleProps {
  onNoteCapture: (count: number) => void;
  onNoteProcessed?: () => void;
}

export const QuickCaptureModule = ({ onNoteCapture, onNoteProcessed }: QuickCaptureModuleProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const { notes, loading, createNote, markAsProcessed, deleteNote, getUnprocessedCount } = useInbox();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleVoiceCapture = async () => {
    if (isRecording) {
      // Simular fin de grabación
      setIsRecording(false);
      const success = await createNote({
        content: 'Nota de voz capturada - Recordar comprar ingredientes para la cena',
        type: 'voice',
        source: 'voice_recording'
      });
      if (success) {
        onNoteCapture(getUnprocessedCount());
      }
    } else {
      // Simular inicio de grabación
      setIsRecording(true);
      toast({
        title: "Grabando...",
        description: "Habla ahora, toca para detener",
      });
    }
  };

  const handleTextCapture = async () => {
    if (textInput.trim()) {
      const success = await createNote({
        content: textInput.trim(),
        type: 'text',
        source: 'manual_input'
      });
      if (success) {
        setTextInput('');
        onNoteCapture(getUnprocessedCount());
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    await deleteNote(id);
    onNoteCapture(getUnprocessedCount());
  };

  const handleMarkAsProcessed = async (id: string) => {
    await markAsProcessed(id);
  };

  const unprocessedCount = getUnprocessedCount();

  return (
    <div className="space-y-6">
      {/* Capture Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Edit3 className="h-5 w-5" />
            <span>Captura Rápida</span>
          </CardTitle>
          <CardDescription>
            Captura ideas, tareas y notas al instante
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Voice Capture */}
          <div className="flex items-center justify-center">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={handleVoiceCapture}
              className={`h-20 w-20 rounded-full ${isRecording ? 'animate-pulse' : ''}`}
            >
              {isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {isRecording ? 'Grabando... Toca para detener' : 'Toca para grabar nota de voz'}
          </div>

          <Separator />

          {/* Text Capture */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Type className="h-4 w-4" />
              <span className="text-sm font-medium">Captura de texto</span>
            </div>
            
            <Textarea
              ref={textareaRef}
              placeholder="Escribe una nota rápida, idea o tarea..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[100px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleTextCapture();
                }
              }}
            />
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Cmd/Ctrl + Enter para enviar
              </span>
              <Button 
                onClick={handleTextCapture}
                disabled={!textInput.trim()}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                Capturar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inbox */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>
                Notas capturadas pendientes de procesar
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {unprocessedCount} sin procesar
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Cargando notas...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Edit3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay notas capturadas</p>
              <p className="text-sm">Usa la captura rápida para empezar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 rounded-lg border transition-all ${
                    note.processed ? 'bg-muted/50 opacity-60' : 'bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex-1">
                      <p className={`text-sm ${note.processed ? 'line-through' : ''}`}>
                        {note.content}
                      </p>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge 
                          variant="outline" 
                          className={note.type === 'voice' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}
                        >
                          {note.type === 'voice' ? <Mic className="h-3 w-3 mr-1" /> : <Type className="h-3 w-3 mr-1" />}
                          {note.type === 'voice' ? 'Voz' : 'Texto'}
                        </Badge>
                        
                        <span className="text-xs text-muted-foreground">
                          {note.captured_at ? new Date(note.captured_at).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : ''}
                        </span>
                        
                        {note.processed && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                            Procesada
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {!note.processed && (
                        <ProcessNoteDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                            >
                              <span className="text-xs">Procesar</span>
                            </Button>
                          }
                          noteId={note.id}
                          noteContent={note.content}
                          onProcessed={() => {
                            onNoteCapture(getUnprocessedCount());
                            onNoteProcessed?.();
                          }}
                        />
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

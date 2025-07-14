import { useState } from 'react';
import { Clock, FileText, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProcessNoteDialog } from '@/components/dialogs/ProcessNoteDialog';
import { useInbox } from '@/hooks/useInbox';
import { toast } from '@/hooks/use-toast';

interface InboxViewProps {
  onNoteProcessed?: () => void;
}

export const InboxView = ({ onNoteProcessed }: InboxViewProps) => {
  const { notes, loading, deleteNote } = useInbox();
  const unprocessedNotes = notes.filter(note => !note.processed);

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      toast({
        title: "Nota eliminada",
        description: "La nota ha sido eliminada del inbox",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la nota",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p className="text-muted-foreground">Cargando notas...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Inbox</span>
            <Badge variant="secondary">{unprocessedNotes.length}</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        {unprocessedNotes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No hay notas por procesar</h3>
            <p className="text-muted-foreground">
              Las notas que captures aparecerán aquí para ser procesadas
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {unprocessedNotes.map((note) => (
              <div
                key={note.id}
                className="group relative p-4 rounded-lg border bg-card hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(note.captured_at).toLocaleString('es-ES')}
                    </p>
                    <p className="text-sm leading-relaxed break-words">
                      {note.content}
                    </p>
                    <div className="flex items-center space-x-2 mt-3">
                      <Badge variant="outline" className="text-xs">
                        {note.type === 'voice' ? 'Voz' : 'Texto'}
                      </Badge>
                      {note.source && (
                        <Badge variant="outline" className="text-xs">
                          {note.source}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <ProcessNoteDialog
                      trigger={
                        <Button size="sm" variant="default">
                          Procesar
                        </Button>
                      }
                      noteId={note.id}
                      noteContent={note.content}
                      onProcessed={onNoteProcessed || (() => {})}
                    />
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
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
  );
};
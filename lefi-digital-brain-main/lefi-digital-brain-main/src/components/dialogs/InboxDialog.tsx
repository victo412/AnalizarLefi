import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InboxView } from '@/components/modules/InboxView';

interface InboxDialogProps {
  children: React.ReactNode;
  onNoteProcessed?: () => void;
}

export const InboxDialog = ({ children, onNoteProcessed }: InboxDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleNoteProcessed = () => {
    setOpen(false);
    onNoteProcessed?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-2">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Inbox - Procesar Notas</DialogTitle>
        </DialogHeader>
        <InboxView onNoteProcessed={handleNoteProcessed} />
      </DialogContent>
    </Dialog>
  );
};
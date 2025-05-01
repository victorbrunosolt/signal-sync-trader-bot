
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AddGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGroup: (group: { name: string; url: string }) => void;
}

const AddGroupDialog = ({ open, onOpenChange, onAddGroup }: AddGroupDialogProps) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !url) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }
    
    onAddGroup({
      name,
      url,
    });
    
    setName('');
    setUrl('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Grupo do Telegram</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="group-name">Nome do Grupo</Label>
              <Input 
                id="group-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Sinais VIP"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-url">URL ou ID do Grupo</Label>
              <Input 
                id="group-url" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Ex: https://t.me/grupodesinais"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGroupDialog;


import MainLayout from '@/components/layout/MainLayout';
import TelegramConnect from '@/components/telegram/TelegramConnect';
import TelegramGroupList from '@/components/telegram/TelegramGroupList';
import SignalParser from '@/components/telegram/SignalParser';
import AddGroupDialog from '@/components/telegram/AddGroupDialog';
import { telegramGroups } from '@/data/sampleData';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const TelegramPage = () => {
  const { toast } = useToast();
  const [groups, setGroups] = useState(telegramGroups);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddGroup = ({ name, url }: { name: string; url: string }) => {
    const newGroup = {
      id: `group-${Date.now()}`,
      name,
      active: true,
      memberCount: 0,
      signalsCount: 0,
      lastSignal: "N/A",
    };
    
    setGroups([...groups, newGroup]);
    
    toast({
      title: "Grupo adicionado",
      description: `O grupo ${name} foi adicionado com sucesso`,
    });
  };

  const handleToggleGroup = (id: string, active: boolean) => {
    setGroups(groups.map(group => 
      group.id === id ? { ...group, active } : group
    ));
    
    toast({
      title: active ? "Grupo ativado" : "Grupo desativado",
      description: `Grupo foi ${active ? 'ativado' : 'desativado'} com sucesso`,
    });
  };
  
  const handleRemoveGroup = (id: string) => {
    setGroups(groups.filter(group => group.id !== id));
    
    toast({
      title: "Grupo removido",
      description: "O grupo foi removido com sucesso",
    });
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Integração com Telegram</h1>
        <p className="text-muted-foreground">Conecte e configure suas fontes de sinais do Telegram</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TelegramConnect />
        <TelegramGroupList 
          groups={groups}
          onAddGroup={() => setIsAddDialogOpen(true)}
          onToggleGroup={handleToggleGroup}
          onRemoveGroup={handleRemoveGroup}
        />
      </div>
      
      <div className="mb-6">
        <SignalParser />
      </div>

      <AddGroupDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onAddGroup={handleAddGroup}
      />
    </MainLayout>
  );
};

export default TelegramPage;


import MainLayout from '@/components/layout/MainLayout';
import TelegramConnect from '@/components/telegram/TelegramConnect';
import TelegramGroupList from '@/components/telegram/TelegramGroupList';
import SignalParser from '@/components/telegram/SignalParser';
import AddGroupDialog from '@/components/telegram/AddGroupDialog';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface TelegramGroup {
  id: string;
  name: string;
  active: boolean;
  memberCount: number;
  signalsCount: number;
  lastSignal: string;
}

const TelegramPage = () => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<TelegramGroup[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch telegram groups when component mounts
  useEffect(() => {
    fetchTelegramGroups();
  }, []);

  // Function to fetch telegram groups
  const fetchTelegramGroups = async () => {
    setIsLoading(true);
    try {
      // In a real-world scenario, this would be an API call to fetch your saved telegram groups
      // For now, we're simulating the API call and returning sample data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulated API response
      const sampleGroups: TelegramGroup[] = [
        {
          id: 'group-1',
          name: 'Crypto VIP Signals',
          active: true,
          memberCount: 1250,
          signalsCount: 32,
          lastSignal: '2 hours ago'
        },
        {
          id: 'group-2',
          name: 'Bitcoin Alerts',
          active: false,
          memberCount: 3480,
          signalsCount: 15,
          lastSignal: '1 day ago'
        }
      ];
      
      setGroups(sampleGroups);
    } catch (error) {
      console.error('Error fetching telegram groups:', error);
      toast({
        title: "Failed to load groups",
        description: "Could not retrieve your Telegram groups",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGroup = async ({ name, url }: { name: string; url: string }) => {
    try {
      // In a real implementation, this would be an API call to add the group to Telegram
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newGroup: TelegramGroup = {
        id: `group-${Date.now()}`,
        name,
        active: true,
        memberCount: 0,
        signalsCount: 0,
        lastSignal: "N/A",
      };
      
      setGroups(prevGroups => [...prevGroups, newGroup]);
      
      toast({
        title: "Grupo adicionado",
        description: `O grupo ${name} foi adicionado com sucesso`,
      });
    } catch (error) {
      console.error('Error adding group:', error);
      toast({
        title: "Erro ao adicionar grupo",
        description: "Não foi possível adicionar o grupo ao Telegram",
        variant: "destructive"
      });
    }
  };

  const handleToggleGroup = async (id: string, active: boolean) => {
    try {
      // In a real implementation, this would be an API call to activate/deactivate the group
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGroups(prevGroups => prevGroups.map(group => 
        group.id === id ? { ...group, active } : group
      ));
      
      toast({
        title: active ? "Grupo ativado" : "Grupo desativado",
        description: `Grupo foi ${active ? 'ativado' : 'desativado'} com sucesso`,
      });
    } catch (error) {
      console.error('Error toggling group status:', error);
      toast({
        title: "Erro ao alterar status",
        description: "Não foi possível alterar o status do grupo",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveGroup = async (id: string) => {
    try {
      // In a real implementation, this would be an API call to remove the group
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGroups(prevGroups => prevGroups.filter(group => group.id !== id));
      
      toast({
        title: "Grupo removido",
        description: "O grupo foi removido com sucesso",
      });
    } catch (error) {
      console.error('Error removing group:', error);
      toast({
        title: "Erro ao remover grupo",
        description: "Não foi possível remover o grupo",
        variant: "destructive"
      });
    }
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

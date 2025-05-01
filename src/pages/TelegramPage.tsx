
import MainLayout from '@/components/layout/MainLayout';
import TelegramConnect from '@/components/telegram/TelegramConnect';
import TelegramGroupList from '@/components/telegram/TelegramGroupList';
import SignalParser from '@/components/telegram/SignalParser';
import { telegramGroups } from '@/data/sampleData';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const TelegramPage = () => {
  const { toast } = useToast();
  const [groups, setGroups] = useState(telegramGroups);

  const handleAddGroup = () => {
    toast({
      title: "Feature not implemented",
      description: "Group adding functionality will be available in the next update",
    });
  };

  const handleToggleGroup = (id: string, active: boolean) => {
    setGroups(groups.map(group => 
      group.id === id ? { ...group, active } : group
    ));
    
    toast({
      title: active ? "Group activated" : "Group deactivated",
      description: `Group has been ${active ? 'activated' : 'deactivated'} successfully`,
    });
  };
  
  const handleRemoveGroup = (id: string) => {
    setGroups(groups.filter(group => group.id !== id));
    
    toast({
      title: "Group removed",
      description: "The group has been removed successfully",
    });
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Telegram Integration</h1>
        <p className="text-muted-foreground">Connect and configure your Telegram signal sources</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TelegramConnect />
        <TelegramGroupList 
          groups={groups}
          onAddGroup={handleAddGroup}
          onToggleGroup={handleToggleGroup}
          onRemoveGroup={handleRemoveGroup}
        />
      </div>
      
      <div className="mb-6">
        <SignalParser />
      </div>
    </MainLayout>
  );
};

export default TelegramPage;

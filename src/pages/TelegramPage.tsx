
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TelegramConnect from '@/components/telegram/TelegramConnect';
import TelegramGroupList from '@/components/telegram/TelegramGroupList';
import SignalParser from '@/components/telegram/SignalParser';
import AddGroupDialog from '@/components/telegram/AddGroupDialog';
import { useToast } from '@/hooks/use-toast';
import { fetchGroups, addGroup, updateGroupStatus, removeGroup, TelegramGroup, isConnectedToTelegram } from '@/services/telegramService';
import { useQuery } from '@tanstack/react-query';

const TelegramPage = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(isConnectedToTelegram());
  }, []);

  // Use React Query to fetch telegram groups
  const { 
    data: groups = [], 
    isLoading, 
    refetch: refetchGroups 
  } = useQuery({
    queryKey: ['telegramGroups'],
    queryFn: fetchGroups,
    enabled: isConnected,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Failed to load groups",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  });

  const handleAddGroup = async ({ name, url }: { name: string; url: string }) => {
    try {
      await addGroup(name, url);
      refetchGroups();
      
      toast({
        title: "Group added",
        description: `Group ${name} has been added successfully`,
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding group:', error);
      toast({
        title: "Failed to add group",
        description: "Could not add the group to Telegram",
        variant: "destructive",
      });
    }
  };

  const handleToggleGroup = async (id: string, active: boolean) => {
    try {
      await updateGroupStatus(id, active);
      refetchGroups();
      
      toast({
        title: active ? "Group activated" : "Group deactivated",
        description: `Group status has been updated`,
      });
    } catch (error) {
      console.error('Error toggling group status:', error);
      toast({
        title: "Status update failed",
        description: "Could not update group status",
        variant: "destructive",
      });
    }
  };
  
  const handleRemoveGroup = async (id: string) => {
    try {
      await removeGroup(id);
      refetchGroups();
      
      toast({
        title: "Group removed",
        description: "The group has been removed successfully",
      });
    } catch (error) {
      console.error('Error removing group:', error);
      toast({
        title: "Removal failed",
        description: "Could not remove the group",
        variant: "destructive",
      });
    }
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

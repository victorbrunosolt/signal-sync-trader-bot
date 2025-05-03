
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TelegramConnect from '@/components/telegram/TelegramConnect';
import TelegramGroupList from '@/components/telegram/TelegramGroupList';
import SignalParser from '@/components/telegram/SignalParser';
import AddGroupDialog from '@/components/telegram/AddGroupDialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { fetchGroups, addGroup, updateGroupStatus, removeGroup, TelegramGroup, isConnectedToTelegram } from '@/services/telegramService';
import { useQuery } from '@tanstack/react-query';

const TelegramPage = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    setIsConnected(isConnectedToTelegram());
  }, []);

  // Use React Query to fetch telegram groups
  const { 
    data: groups = [], 
    isLoading, 
    error: groupsError,
    refetch: refetchGroups 
  } = useQuery({
    queryKey: ['telegramGroups'],
    queryFn: fetchGroups,
    enabled: isConnected,
    retry: 1,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching groups:', error);
        
        // Check if it's a network error (backend not available)
        if (error.message.includes('Network error')) {
          setBackendError('Cannot connect to backend server. Please ensure the server is running.');
        }
        
        // Authentication errors
        if (error.message.includes('Authentication error')) {
          setIsConnected(false);
        }
        
        toast({
          title: "Failed to load groups",
          description: error.message,
          variant: "destructive",
        });
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error adding group:', error);
      toast({
        title: "Failed to add group",
        description: errorMessage,
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error toggling group status:', error);
      toast({
        title: "Status update failed",
        description: errorMessage,
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error removing group:', error);
      toast({
        title: "Removal failed",
        description: errorMessage,
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

      {backendError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Backend Connection Error</AlertTitle>
          <AlertDescription>{backendError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TelegramConnect onConnectionStateChange={(state) => setIsConnected(state)} />
        <TelegramGroupList 
          groups={groups}
          isLoading={isLoading}
          error={groupsError instanceof Error ? groupsError.message : null}
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

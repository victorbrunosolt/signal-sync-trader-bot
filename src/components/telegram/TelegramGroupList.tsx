
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { fetchGroups, updateGroupStatus, removeGroup, TelegramGroup } from '@/services/telegramService';

interface TelegramGroupListProps {
  groups: TelegramGroup[];
  isLoading?: boolean;
  error?: string | null;
  onAddGroup: () => void;
  onToggleGroup: (id: string, active: boolean) => void;
  onRemoveGroup: (id: string) => void;
}

const TelegramGroupList = ({ 
  groups = [], 
  isLoading = false, 
  error = null,
  onAddGroup, 
  onToggleGroup, 
  onRemoveGroup 
}: TelegramGroupListProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [localGroups, setLocalGroups] = useState<TelegramGroup[]>(groups);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    setLocalGroups(groups);
  }, [groups]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const refreshedGroups = await fetchGroups();
      setLocalGroups(refreshedGroups);
      
      toast({
        title: "Groups refreshed",
        description: "Telegram group data has been updated",
      });
    } catch (error) {
      console.error("Error refreshing groups:", error);
      toast({
        title: "Refresh failed",
        description: error instanceof Error ? error.message : "Could not refresh group data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGroup = async (id: string, active: boolean) => {
    setActionInProgress(id);
    try {
      await updateGroupStatus(id, active);
      setLocalGroups(prevGroups => prevGroups.map(group => 
        group.id === id ? { ...group, active } : group
      ));
      onToggleGroup(id, active);
      
      toast({
        title: active ? "Group activated" : "Group deactivated",
        description: `Group status has been updated`,
      });
    } catch (error) {
      console.error("Error toggling group status:", error);
      toast({
        title: "Status update failed",
        description: error instanceof Error ? error.message : "Could not update group status",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRemoveGroup = async (id: string) => {
    setActionInProgress(id);
    try {
      await removeGroup(id);
      setLocalGroups(prevGroups => prevGroups.filter(group => group.id !== id));
      onRemoveGroup(id);
      
      toast({
        title: "Group removed",
        description: "The group has been removed successfully",
      });
    } catch (error) {
      console.error("Error removing group:", error);
      toast({
        title: "Removal failed",
        description: error instanceof Error ? error.message : "Could not remove the group",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Telegram Groups</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading || isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading || isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={onAddGroup} disabled={isLoading}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Group
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading groups...</p>
          </div>
        ) : localGroups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No groups added yet</p>
            <Button variant="outline" size="sm" onClick={onAddGroup}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Group
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {localGroups.map((group) => (
              <div 
                key={group.id}
                className="p-4 border rounded-md flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{group.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {group.memberCount} members
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {group.signalsCount} signals tracked • Last signal: {group.lastSignal}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={group.active} 
                      onCheckedChange={(checked) => handleToggleGroup(group.id, checked)}
                      disabled={actionInProgress === group.id}
                    />
                    <span className="text-sm">
                      {actionInProgress === group.id ? 
                        'Processing...' : 
                        group.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveGroup(group.id)}
                    disabled={actionInProgress === group.id}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TelegramGroupList;

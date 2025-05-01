
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TelegramGroup {
  id: string;
  name: string;
  active: boolean;
  memberCount: number;
  signalsCount: number;
  lastSignal: string;
}

interface TelegramGroupListProps {
  groups: TelegramGroup[];
  onAddGroup: () => void;
  onToggleGroup: (id: string, active: boolean) => void;
  onRemoveGroup: (id: string) => void;
}

const TelegramGroupList = ({ groups, onAddGroup, onToggleGroup, onRemoveGroup }: TelegramGroupListProps) => {
  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Telegram Groups</CardTitle>
        <Button size="sm" onClick={onAddGroup}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No groups added yet</p>
            <Button variant="outline" size="sm" onClick={onAddGroup}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Group
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
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
                      onCheckedChange={(checked) => onToggleGroup(group.id, checked)}
                    />
                    <span className="text-sm">{group.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveGroup(group.id)}
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


import {
  Sidebar, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Database, BarChart, MessageSquare, Settings, ChevronRight, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ConnectionStatus from './ConnectionStatus';

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center">
          <div className="flex items-center gap-2 font-semibold text-lg text-primary">
            <ChevronRight className="h-5 w-5" />
            <span>Signal Sync</span>
          </div>
          <div className="ml-auto">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/">
                    <BarChart className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/telegram">
                    <MessageSquare className="h-4 w-4" />
                    <span>Telegram</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/exchange">
                    <Database className="h-4 w-4" />
                    <span>Exchange</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Telegram Groups</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span>VIP Signals</span>
                  <span className="text-xs py-0.5 px-2 rounded-full bg-primary/20 text-primary ml-auto">Active</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span>Crypto Masters</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <span>Whale Alerts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="px-3 mt-2">
              <Button variant="outline" size="sm" className="w-full text-xs">
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                Add Group
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <ConnectionStatus />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

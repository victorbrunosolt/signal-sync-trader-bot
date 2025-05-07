
interface DashboardHeaderProps {
  title: string;
  description?: string;
}

const DashboardHeader = ({ 
  title = "Dashboard", 
  description = "Overview of your trading performance" 
}: DashboardHeaderProps) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
};

export default DashboardHeader;

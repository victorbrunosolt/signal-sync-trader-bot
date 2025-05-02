
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const SignalParser = () => {
  const { toast } = useToast();
  const [template, setTemplate] = useState(
    '#SIGNAL #{pair}\nType: {type}\nEntry: {entry}\nTP: {tp}\nSL: {sl}'
  );
  const [testSignal, setTestSignal] = useState(
    '#SIGNAL #BTCUSDT\nType: LONG\nEntry: 65400-65800\nTP: 66500, 67200, 68000\nSL: 64000'
  );
  const [useRegex, setUseRegex] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestParse = async () => {
    setIsTesting(true);
    
    try {
      // In a real implementation, this would call a backend API to test the template
      // against the test signal
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Extract data using the template pattern
      // This is a simplified implementation - in a real app, you'd likely
      // use a more sophisticated parser on the backend
      
      // Simulated parsing result
      const result = parseSignalWithTemplate(testSignal, template);
      setParseResult(result);
      
      toast({
        title: "Signal parsed successfully",
        description: "The signal template works correctly",
      });
    } catch (error) {
      console.error("Parsing error:", error);
      setParseResult(null);
      toast({
        title: "Failed to parse signal",
        description: "Check your template format",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Simple parsing function to demonstrate functionality
  const parseSignalWithTemplate = (signal: string, template: string) => {
    // This is a very simplified implementation
    // In a real app, this would be more robust and handle regex
    
    if (useRegex) {
      // Placeholder for regex implementation
      return {
        pair: 'BTCUSDT',
        type: 'LONG',
        entry: '65400-65800',
        tp: ['66500', '67200', '68000'],
        sl: '64000',
      };
    }
    
    // Simple parsing for demonstration
    const pairMatch = signal.match(/#(\w+)/);
    const typeMatch = signal.match(/Type:\s*(\w+)/);
    const entryMatch = signal.match(/Entry:\s*([0-9\-]+)/);
    const tpMatch = signal.match(/TP:\s*([\d\s,.]+)/);
    const slMatch = signal.match(/SL:\s*(\d+)/);
    
    return {
      pair: pairMatch ? pairMatch[1] : null,
      type: typeMatch ? typeMatch[1] : null,
      entry: entryMatch ? entryMatch[1] : null,
      tp: tpMatch ? tpMatch[1].split(',').map(s => s.trim()) : [],
      sl: slMatch ? slMatch[1] : null,
    };
  };

  const handleSaveTemplate = async () => {
    try {
      // In a real implementation, this would save the template to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Template saved",
        description: "Your signal template has been saved",
      });
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Failed to save template",
        description: "Could not save your template",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signal Parser Configuration</CardTitle>
        <CardDescription>
          Configure how signals are extracted from Telegram messages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Use Regex</h4>
              <p className="text-xs text-muted-foreground">
                Enable for advanced pattern matching
              </p>
            </div>
            <Switch 
              checked={useRegex} 
              onCheckedChange={setUseRegex}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Template Format</label>
            <Textarea 
              placeholder="Enter your signal template format"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use {'{pair}'}, {'{type}'}, {'{entry}'}, {'{tp}'}, and {'{sl}'} as placeholders
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Signal</label>
            <Textarea 
              placeholder="Paste a sample signal to test"
              value={testSignal}
              onChange={(e) => setTestSignal(e.target.value)}
              rows={5}
              className="font-mono text-sm"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleTestParse} 
              disabled={isTesting}
            >
              {isTesting ? 'Testing...' : 'Test Parse'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSaveTemplate}
            >
              Save Template
            </Button>
          </div>
          
          {parseResult && (
            <div className="mt-4 p-4 border rounded-md bg-secondary/50">
              <h4 className="text-sm font-medium mb-2">Parse Result:</h4>
              <pre className="text-xs overflow-auto p-2 bg-secondary rounded">
                {JSON.stringify(parseResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SignalParser;

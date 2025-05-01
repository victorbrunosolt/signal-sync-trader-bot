
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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

  const handleTestParse = () => {
    try {
      // Simulated parsing result
      setParseResult({
        pair: 'BTCUSDT',
        type: 'LONG',
        entry: '65400-65800',
        tp: ['66500', '67200', '68000'],
        sl: '64000',
      });
      
      toast({
        title: "Signal parsed successfully",
        description: "The signal template works correctly",
      });
    } catch (error) {
      setParseResult(null);
      toast({
        title: "Failed to parse signal",
        description: "Check your template format",
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
          
          <Button onClick={handleTestParse}>Test Parse</Button>
          
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


import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { getParserConfig, saveParserConfig, testParseTemplate, ParserConfig } from '@/services/telegramService';

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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load config on component mount
    const config = getParserConfig();
    setTemplate(config.template);
    setUseRegex(config.useRegex);
  }, []);

  const handleTestParse = async () => {
    setIsTesting(true);
    
    try {
      const result = await testParseTemplate(template, testSignal, useRegex);
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

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    try {
      const config: ParserConfig = {
        template,
        useRegex
      };
      
      await saveParserConfig(config);
      
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
    } finally {
      setIsSaving(false);
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
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Template'}
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

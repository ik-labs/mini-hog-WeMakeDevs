'use client';

import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // This would come from environment or user settings
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'mh_test_12345678901234567890123456789012';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  const maskedApiKey = showApiKey ? apiKey : apiKey.substring(0, 10) + '••••••••••••••••••••••';

  const sdkSnippet = `<!-- Add to your HTML -->
<script src="https://unpkg.com/@minihog/sdk@latest/dist/index.global.js"></script>
<script>
  // Initialize Minihog SDK
  const minihog = Minihog.init({
    endpoint: '${apiUrl}',
    apiKey: '${apiKey}',
    debug: true
  });

  // Track a page view
  minihog.page();

  // Track custom events
  minihog.track('button_clicked', {
    button_name: 'Sign Up',
    page: 'homepage'
  });

  // Identify users
  minihog.identify('user_123', {
    name: 'John Doe',
    email: 'john@example.com'
  });
</script>`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/40">
        <div className="p-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your API keys and SDK integration
            </p>
          </div>

          {/* API Key Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>API Key</CardTitle>
              <CardDescription>
                Your API key for authenticating requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={maskedApiKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(apiKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied && (
                <p className="text-sm text-green-600">Copied to clipboard!</p>
              )}
              <p className="text-sm text-muted-foreground">
                Keep your API key secret. Don&apos;t share it publicly or commit it to version control.
              </p>
            </CardContent>
          </Card>

          {/* SDK Integration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>SDK Integration</CardTitle>
              <CardDescription>
                Copy and paste this snippet into your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{sdkSnippet}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(sdkSnippet)}
                >
                  <Copy className="h-3 w-3 mr-2" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API Endpoint */}
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint</CardTitle>
              <CardDescription>
                Your Minihog API endpoint URL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={apiUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(apiUrl)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

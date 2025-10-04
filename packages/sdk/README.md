# @minihog/sdk

Browser SDK for Minihog Analytics - Lightweight event tracking for web applications.

## Features

- 🚀 Lightweight (< 10KB gzipped)
- 📦 Automatic event batching
- 🔄 Auto-retry on failure
- 💾 localStorage persistence
- 🎯 Session tracking
- 📊 Page view tracking
- 🔐 API key authentication
- 📱 Modern browser support (ES2020+)

## Installation

```bash
npm install @minihog/sdk
```

Or use via CDN:

```html
<script src="https://unpkg.com/@minihog/sdk@latest/dist/index.global.js"></script>
```

## Usage

### Initialize the SDK

```typescript
import { init } from '@minihog/sdk';

const minihog = init({
  endpoint: 'http://localhost:3000/api',
  apiKey: 'your_api_key_here',
  debug: true, // Enable debug logging
});
```

### Track Events

```typescript
// Track a custom event
minihog.track('button_clicked', {
  button_name: 'Sign Up',
  page: 'homepage',
});

// Track a page view (automatically includes URL, title, referrer)
minihog.page();

// Track a page view with custom properties
minihog.page({
  category: 'Marketing',
  campaign: 'summer_sale',
});
```

### Identify Users

```typescript
// Identify a user
minihog.identify('user_123', {
  name: 'John Doe',
  email: 'john@example.com',
  plan: 'premium',
});
```

### Manual Flush

```typescript
// Manually flush the event queue
await minihog.flush();
```

### Reset (Logout)

```typescript
// Clear user identification and generate new anonymous ID
minihog.reset();
```

## Configuration Options

```typescript
interface MinihogConfig {
  endpoint: string;              // API endpoint URL
  apiKey: string;                // API key for authentication
  debug?: boolean;               // Enable debug logging (default: false)
  maxBatchSize?: number;         // Max events before auto-flush (default: 10)
  flushInterval?: number;        // Auto-flush interval in ms (default: 10000)
  disableAutoPageTracking?: boolean; // Disable automatic page tracking (default: false)
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari 14+
- Modern browsers with ES2020 support

## License

MIT

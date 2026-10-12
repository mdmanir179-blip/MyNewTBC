import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'store.json');

// Zero demo products and zero demo claims by default (Clean state)
const INITIAL_PRODUCTS: any[] = [];
const INITIAL_CLAIMS: any[] = [];

interface DatabaseSchema {
  products: any[];
  claims: any[];
  updatedAt: number;
}

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.products) && Array.isArray(parsed.claims)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading store file, initializing fresh:', err);
  }

  const initialData: DatabaseSchema = {
    products: INITIAL_PRODUCTS,
    claims: INITIAL_CLAIMS,
    updatedAt: Date.now()
  };
  saveDatabase(initialData);
  return initialData;
}

function saveDatabase(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    data.updatedAt = Date.now();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

let db = loadDatabase();

// SSE Connected Clients for 0ms cross-device real-time updates
const sseClients: Response[] = [];

function broadcastToClients(type: string, payload: any) {
  const data = JSON.stringify({ type, payload, timestamp: Date.now() });
  sseClients.forEach((client) => {
    try {
      client.write(`data: ${data}\n\n`);
    } catch {}
  });
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Upload directory setup & static serving for uploaded product/proof images
  const UPLOAD_DIR = path.resolve(DATA_DIR, 'uploads');
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  app.use('/uploads', express.static(UPLOAD_DIR));

  // POST /api/upload: Store base64 uploaded image to server disk and return URL
  app.post('/api/upload', (req: Request, res: Response) => {
    try {
      const { image, filename } = req.body;
      if (!image || typeof image !== 'string') {
        res.status(400).json({ error: 'Image data missing or invalid' });
        return;
      }

      // Check base64 pattern
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      let ext = 'jpg';
      if (matches && matches.length === 3) {
        const mime = matches[1].toLowerCase();
        if (mime.includes('png')) ext = 'png';
        else if (mime.includes('webp')) ext = 'webp';
        else if (mime.includes('gif')) ext = 'gif';
        else if (mime.includes('svg')) ext = 'svg';
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(image, 'base64');
      }

      const safeName = `wms_img_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}.${ext}`;
      const filePath = path.resolve(UPLOAD_DIR, safeName);
      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${safeName}`;
      res.json({ success: true, url: fileUrl, filename: safeName });
    } catch (err: any) {
      console.error('Image upload failed:', err);
      res.status(500).json({ error: 'Server failed to save image' });
    }
  });

  // Server-Sent Events stream for cross-device live synchronization
  app.get('/api/events', (req: Request, res: Response) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    // Immediately send the latest products upon connecting
    res.write(`data: ${JSON.stringify({ type: 'SYNC_PRODUCTS', payload: db.products, timestamp: Date.now() })}\n\n`);
    sseClients.push(res);

    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  // Keep-alive heartbeat every 10s to prevent reverse proxy timeouts
  setInterval(() => {
    sseClients.forEach((client) => {
      try {
        client.write(': ping\n\n');
      } catch {}
    });
  }, 10000);

  // GET Products
  app.get('/api/products', (req: Request, res: Response) => {
    res.json({ products: db.products, updatedAt: db.updatedAt });
  });

  // POST Products (Add new product or update existing)
  app.post('/api/products', (req: Request, res: Response) => {
    const product = req.body;
    if (!product || !product.id || !product.title) {
      res.status(400).json({ error: 'Invalid product data' });
      return;
    }

    const idx = db.products.findIndex((p) => p.id === product.id);
    if (idx !== -1) {
      db.products[idx] = { ...db.products[idx], ...product };
    } else {
      db.products.unshift(product);
    }
    saveDatabase(db);
    broadcastToClients('SYNC_PRODUCTS', db.products);
    res.json({ success: true, product, products: db.products });
  });

  // PUT Product (Update existing product)
  app.put('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    db.products[idx] = { ...db.products[idx], ...updates };
    saveDatabase(db);
    broadcastToClients('SYNC_PRODUCTS', db.products);
    res.json({ success: true, product: db.products[idx], products: db.products });
  });

  // DELETE Product - immediately removed on all devices & customer portal
  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const beforeCount = db.products.length;
    db.products = db.products.filter((p) => p.id !== id);
    saveDatabase(db);
    broadcastToClients('SYNC_PRODUCTS', db.products);
    res.json({
      success: true,
      deletedId: id,
      deleted: beforeCount !== db.products.length,
      products: db.products
    });
  });

  // Clean Slate - wipes all products and claims
  app.post('/api/clean-slate', (req: Request, res: Response) => {
    db.products = [];
    db.claims = [];
    saveDatabase(db);
    broadcastToClients('SYNC_ALL', { products: [], claims: [] });
    res.json({ success: true, message: 'All data cleared', products: [], claims: [] });
  });

  // Reset Demo Data
  app.post('/api/reset-demo', (req: Request, res: Response) => {
    db.products = [...INITIAL_PRODUCTS];
    db.claims = [...INITIAL_CLAIMS];
    saveDatabase(db);
    broadcastToClients('SYNC_ALL', { products: db.products, claims: db.claims });
    res.json({ success: true, message: 'Reset to demo catalog', products: db.products, claims: db.claims });
  });

  // GET Claims
  app.get('/api/claims', (req: Request, res: Response) => {
    res.json({ claims: db.claims, updatedAt: db.updatedAt });
  });

  // POST Claim
  app.post('/api/claims', (req: Request, res: Response) => {
    const claim = req.body;
    if (!claim || !claim.id) {
      res.status(400).json({ error: 'Invalid claim' });
      return;
    }
    db.claims.unshift(claim);
    // increment product claimed slots if found
    const prod = db.products.find((p) => p.id === claim.productId);
    if (prod) {
      prod.claimedSlots = (prod.claimedSlots || 0) + 1;
    }
    saveDatabase(db);
    broadcastToClients('SYNC_ALL', { products: db.products, claims: db.claims });
    res.json({ success: true, claim, claims: db.claims });
  });

  // PUT Claim (Approve, Reject, or Payout)
  app.put('/api/claims/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const idx = db.claims.findIndex((c) => c.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Claim not found' });
      return;
    }

    db.claims[idx] = { ...db.claims[idx], ...updates };
    saveDatabase(db);
    broadcastToClients('SYNC_ALL', { products: db.products, claims: db.claims });
    res.json({ success: true, claim: db.claims[idx], claims: db.claims });
  });

  // Mount Vite middlewares in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TBC WMS Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

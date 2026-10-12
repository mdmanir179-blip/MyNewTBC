// Vercel Serverless Function Handler for /api/*
import type { Request, Response } from 'express';

// In-memory store for Vercel Serverless instance
let memoryProducts: any[] = [];
let memoryClaims: any[] = [];

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';

  if (url.includes('/products')) {
    if (req.method === 'GET') {
      return res.status(200).json({ products: memoryProducts });
    }
    if (req.method === 'POST') {
      const product = req.body;
      if (product && product.id) {
        const idx = memoryProducts.findIndex((p: any) => p.id === product.id);
        if (idx !== -1) {
          memoryProducts[idx] = { ...memoryProducts[idx], ...product };
        } else {
          memoryProducts.unshift(product);
        }
      }
      return res.status(200).json({ success: true, products: memoryProducts });
    }
    if (req.method === 'DELETE') {
      const parts = url.split('/');
      const id = parts[parts.length - 1];
      memoryProducts = memoryProducts.filter((p: any) => p.id !== id);
      return res.status(200).json({ success: true, products: memoryProducts });
    }
  }

  if (url.includes('/clean-slate')) {
    memoryProducts = [];
    memoryClaims = [];
    return res.status(200).json({ success: true, products: [], claims: [] });
  }

  if (url.includes('/upload')) {
    if (req.method === 'POST') {
      const { image } = req.body || {};
      return res.status(200).json({ success: true, url: image });
    }
  }

  return res.status(200).json({ status: 'ok' });
}

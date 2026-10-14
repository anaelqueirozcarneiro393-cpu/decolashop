export type ProductSource = 'YouTube' | 'Google' | 'Comunidades';
export type ProductStatus = 'ALTA' | 'ESTÁVEL' | 'CAINDO';

export interface Product {
  id: string;
  name: string;
  price: string | number;
  image_url: string;
  hype_score: number;
  url: string;
  category?: string;
  status?: ProductStatus;
  commission?: string;
  vendas_mes?: number;
  description?: string;
  title?: string;
  score?: number;
  supplier?: string;
  supplierId?: string;
  currency?: 'BRL' | 'USD';
  origin?: string;
  evidence?: any;
  [key: string]: any;
}

import nationalCatalogJson from '@/data/nationalCatalog2500.json';

export const mockProducts: Product[] = nationalCatalogJson as Product[];

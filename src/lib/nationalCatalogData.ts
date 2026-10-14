// Catálogo Nacional Oficial DecolaShop com +2.500 Produtos Minerados Únicos
import { Product } from './mockData';
import nationalData from '@/data/nationalCatalog2500.json';

export const NATIONAL_CATALOG_2500: Product[] = nationalData as Product[];

export function getNationalCatalogCount(): number {
  return NATIONAL_CATALOG_2500.length;
}

export function getNationalProductsBySuppliers(activatedIds: string[]): Product[] {
  if (!activatedIds || activatedIds.length === 0) {
    return NATIONAL_CATALOG_2500;
  }
  const idSet = new Set(activatedIds.map(id => id.toLowerCase()));
  const filtered = NATIONAL_CATALOG_2500.filter(p => idSet.has((p.supplierId || '').toLowerCase()));
  return filtered.length > 0 ? filtered : NATIONAL_CATALOG_2500;
}

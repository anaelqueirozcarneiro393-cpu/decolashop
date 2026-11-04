// Catálogo Nacional Oficial DecolaShop com Produtos Minerados Únicos (Sem Repetições)
import { Product } from './mockData';
import nationalData from '@/data/nationalCatalog2500.json';

function deduplicateCatalog(items: any[]): Product[] {
  const seen = new Set<string>();
  const unique: Product[] = [];

  for (const p of items) {
    const cleanTitle = (p.name || p.title || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
    const key = cleanTitle.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({
        ...p,
        name: cleanTitle,
        title: cleanTitle
      });
    }
  }

  return unique;
}

export const NATIONAL_CATALOG_2500: Product[] = deduplicateCatalog(nationalData as any[]);

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

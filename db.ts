
import { Dexie, Table } from 'dexie';
import { Product, Bill, Expense, Settings } from './types';

// Fix: Replace class inheritance with a typed Dexie instance to ensure 'version' and other methods are correctly recognized by the TypeScript compiler.
export const db = new Dexie('ShopBillDB') as Dexie & {
  products: Table<Product>;
  bills: Table<Bill>;
  expenses: Table<Expense>;
  settings: Table<Settings>;
};

// Fix: Define schema and version outside of a class constructor to avoid potential inheritance-related type resolution issues.
db.version(2).stores({
  products: '++id, name, category',
  bills: '++id, billNumber, date, paymentMode',
  expenses: '++id, date',
  settings: '++id'
});

/**
 * Ensures that initial shop settings are present in the database.
 */
export async function ensureSettings() {
  const count = await db.settings.count();
  if (count === 0) {
    await db.settings.add({
      shopName: 'My Awesome Shop',
      shopPhone: '1234567890',
      currencySymbol: '₹'
    });
  }
}

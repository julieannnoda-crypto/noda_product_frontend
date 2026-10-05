import { useCallback, useEffect, useMemo, useState } from 'react';
import { Archive, Boxes, Check, CircleAlert, LogOut, Package, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { getProducts, deleteProduct, errorMessage } from '../api.js';
import ProductForm from './ProductForm.jsx';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export default function ProductList({ user, onLogout }) {
  const isAdmin = user.role === 'admin';
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formFor, setFormFor] = useState(null); // null = closed, {} = add, product = edit

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.product_name}"?`)) return;
    try {
      await deleteProduct(p.id);
      setNotice('Product deleted.');
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleSaved = (msg) => {
    setFormFor(null);
    setNotice(msg);
    load();
  };

  const lowStock = products.filter((product) => Number(product.quantity) < 5).length;
  const stockTotal = products.reduce((total, product) => total + Number(product.quantity || 0), 0);
  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery = !normalizedQuery || [product.product_name, product.description, String(product.id)]
        .some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
      const matchesFilter = filter === 'all' || Number(product.quantity) < 5;
      return matchesQuery && matchesFilter;
    });
  }, [filter, products, query]);

  return (
    <main className="inventory-app">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Northstar Inventory home">
          <span className="brand-mark"><Boxes size={21} strokeWidth={2.2} /></span>
          <span>Northstar<span className="brand-light"> / Stockroom</span></span>
        </a>
        <div className="topbar-right">
          <span className="account-pill"><span className="avatar">{user.username?.slice(0, 1).toUpperCase()}</span><span className="account-copy"><strong>{user.username}</strong><small>{isAdmin ? 'Administrator' : 'Viewer'}</small></span></span>
          <button className="icon-button logout-button" onClick={onLogout} title="Sign out" aria-label="Sign out"><LogOut size={17} /></button>
        </div>
      </header>

      <section className="page-content">
        <div className="breadcrumb"><span>Workspace</span><span className="crumb-divider">/</span><strong>Inventory</strong></div>
        <div className="page-heading">
          <div>
            <div className="eyebrow"><span className="live-dot" /> INVENTORY OVERVIEW</div>
            <h1>Product catalog</h1>
            <p className="page-description">Keep an eye on what’s in stock and where attention is needed.</p>
          </div>
          {isAdmin && <button className="primary-button add-button" onClick={() => setFormFor({})}><Plus size={17} /> Add product</button>}
        </div>

        {error && <div className="alert error"><CircleAlert size={18} />{error}</div>}
        {notice && <button className="alert success" onClick={() => setNotice('')}><Check size={17} />{notice}<span className="dismiss-note">Dismiss</span></button>}

        <section className="metrics" aria-label="Inventory summary">
          <article className="metric metric-primary"><span className="metric-icon"><Package size={19} /></span><div><span className="metric-label">Catalog items</span><strong>{loading ? '—' : products.length}</strong></div><small>listed products</small></article>
          <article className="metric"><span className="metric-icon metric-icon-green"><Archive size={18} /></span><div><span className="metric-label">Units in stock</span><strong>{loading ? '—' : stockTotal.toLocaleString()}</strong></div><small>across all items</small></article>
          <article className={`metric ${lowStock ? 'metric-warning' : ''}`}><span className="metric-icon metric-icon-amber"><CircleAlert size={18} /></span><div><span className="metric-label">Low stock</span><strong>{loading ? '—' : lowStock}</strong></div><small>{lowStock === 1 ? 'item needs' : 'items need'} attention</small></article>
        </section>

        <section className="catalog-section">
          <div className="catalog-heading"><div><div className="section-kicker">STOCKROOM</div><h2>All products <span className="result-count">{loading ? '' : products.length}</span></h2></div><button className="refresh-button" onClick={load} disabled={loading} title="Refresh inventory" aria-label="Refresh inventory"><RefreshCw size={16} className={loading ? 'spin' : ''} /></button></div>
          <div className="catalog-tools">
            <label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." aria-label="Search products" /><kbd>⌘ K</kbd></label>
            <div className="filter-group" aria-label="Filter products">
              <button className={filter === 'all' ? 'filter-button active' : 'filter-button'} onClick={() => setFilter('all')}>All items</button>
              <button className={filter === 'low' ? 'filter-button active' : 'filter-button'} onClick={() => setFilter('low')}><span className="filter-dot" />Low stock</button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead><tr><th className="id-column">ITEM</th><th>PRODUCT</th><th>DESCRIPTION</th><th className="num">UNIT PRICE</th><th>AVAILABILITY</th><th className="num">QUANTITY</th>{isAdmin && <th className="action-column"> </th>}</tr></thead>
              <tbody>
                {loading && <tr><td colSpan={isAdmin ? 7 : 6} className="table-message"><span className="spinner" /> Loading inventory…</td></tr>}
                {!loading && visibleProducts.length === 0 && <tr><td colSpan={isAdmin ? 7 : 6} className="table-message"><span className="empty-icon"><Package size={22} /></span><strong>{products.length ? 'No matching products' : 'Your catalog is empty'}</strong><span>{products.length ? 'Try another search or filter.' : 'Products will appear here once they are added.'}</span></td></tr>}
                {!loading && visibleProducts.map((product, index) => {
                  const quantity = Number(product.quantity);
                  const isLow = quantity < 5;
                  return (
                    <tr key={product.id} className="product-row">
                      <td className="id-column"><span className="item-id">{String(product.id).padStart(3, '0')}</span></td>
                      <td><div className="product-cell"><span className={`product-glyph glyph-${index % 4}`}><Package size={17} /></span><strong>{product.product_name}</strong></div></td>
                      <td className="description-cell">{product.description || <span className="no-description">No description</span>}</td>
                      <td className="num price-cell">{peso.format(product.price)}</td>
                      <td><span className={`stock-badge ${isLow ? 'stock-low' : 'stock-ready'}`}><span />{isLow ? 'Low stock' : 'In stock'}</span></td>
                      <td className="num quantity-cell">{quantity.toLocaleString()} <span>units</span></td>
                      {isAdmin && <td className="row-actions"><button className="row-action" onClick={() => setFormFor(product)} title={`Edit ${product.product_name}`} aria-label={`Edit ${product.product_name}`}><Pencil size={16} /></button><button className="row-action row-action-danger" onClick={() => handleDelete(product)} title={`Delete ${product.product_name}`} aria-label={`Delete ${product.product_name}`}><Trash2 size={16} /></button></td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <footer className="catalog-footer"><span>Showing <strong>{loading ? '—' : visibleProducts.length}</strong> of <strong>{loading ? '—' : products.length}</strong> items</span><span className="sync-status"><span className="live-dot" /> Inventory is up to date</span></footer>
        </section>
        <footer className="page-footer"><span>Northstar Inventory</span><span>PRODUCT OPERATIONS <span className="footer-separator">/</span> 2026</span></footer>
      </section>

      {isAdmin && formFor && (
        <ProductForm
          product={formFor.id ? formFor : null}
          onSaved={handleSaved}
          onCancel={() => setFormFor(null)}
        />
      )}
    </main>
  );
}

import { useState } from 'react';
import { X } from 'lucide-react';
import { createProduct, updateProduct, errorMessage } from '../api.js';

const empty = { product_name: '', description: '', price: '', quantity: '' };

export default function ProductForm({ product, onSaved, onCancel }) {
  const editing = !!product;
  const [form, setForm] = useState(editing ? { ...product } : empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const payload = {
      product_name: form.product_name,
      description: form.description,
      price: form.price,
      quantity: form.quantity,
    };
    try {
      editing ? await updateProduct(product.id, payload) : await createProduct(payload);
      onSaved(editing ? 'Product updated.' : 'Product added.');
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-heading"><div><span className="section-kicker">PRODUCT DETAILS</span><h2 id="product-form-title">{editing ? 'Edit product' : 'Add a product'}</h2><p>{editing ? 'Update information for this catalog item.' : 'Add a new item to your inventory.'}</p></div><button type="button" className="icon-button" onClick={onCancel} title="Close" aria-label="Close"><X size={19} /></button></div>
        {error && <div className="alert error">{error}</div>}
        <form className="product-form" onSubmit={submit}>
          <label>Product name
            <input value={form.product_name} onChange={set('product_name')} maxLength={100} required autoFocus placeholder="e.g. Ceramic pour-over set" />
          </label>
          <label>Description <span className="optional-label">OPTIONAL</span>
            <textarea rows={3} value={form.description ?? ''} onChange={set('description')} placeholder="Add a short product description" />
          </label>
          <div className="row">
            <label>Unit price
              <span className="input-prefix"><span>₱</span><input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required placeholder="0.00" /></span>
            </label>
            <label>Quantity
              <input type="number" min="0" step="1" value={form.quantity} onChange={set('quantity')} required placeholder="0" />
            </label>
          </div>
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={onCancel}>Cancel</button><button className="primary-button" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add to catalog'}</button></div>
        </form>
      </div>
    </div>
  );
}

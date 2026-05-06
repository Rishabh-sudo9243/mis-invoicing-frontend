import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';

const API = 'https://mis-invoicing-backend.onrender.com/api/invoices';

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
export function InvoiceDashboard() {
  const [invoices, setInvoices] = useState([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const fetchInvoices = async (keyword = '') => {
    const url = keyword ? `${API}?search=${keyword}` : API;
    const res = await fetch(url);
    const data = await res.json();
    setInvoices(data);
  };

  const fetchCount = async () => {
    const res = await fetch(`${API}/count`);
    const data = await res.json();
    setCount(data);
  };

  useEffect(() => {
    fetchInvoices();
    fetchCount();
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchInvoices(val);
  };

  const handleDelete = async () => {
    await fetch(`${API}/${deleteTarget}`, { method: 'DELETE' });
    setDeleteTarget(null);
    fetchInvoices(search);
    fetchCount();
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="container mt-4">
        <h4 className="mb-3">Manage Invoice Section</h4>

        {/* Stat Card */}
        <div className="card text-white mb-3"
          style={{ backgroundColor: '#e63946', width: '160px' }}>
          <div className="card-body py-2 px-3">
            <div className="small">Total Invoice</div>
            <div className="fs-4 fw-bold">{count}</div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-3">
          <label className="fw-semibold">Search Invoice</label>
          <input
            className="form-control"
            placeholder="type invoice number, chain id or company name"
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Table */}
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Sr.No</th>
              <th>Invoice NO</th>
              <th>Estimate ID</th>
              <th>Chain ID</th>
              <th>Service Details</th>
              <th>Total Qty</th>
              <th>Price Per Qty</th>
              <th>Total</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr><td colSpan={10} className="text-center">No invoices found</td></tr>
            ) : invoices.map((inv, idx) => (
              <tr key={inv.id}>
                <td>{idx + 1}</td>
                <td>{inv.invoiceNo}</td>
                <td>{inv.estimatedId}</td>
                <td>{inv.chainId}</td>
                <td>{inv.serviceDetails}</td>
                <td>{inv.qty}</td>
                <td>{inv.costPerQty}</td>
                <td>{inv.amountPayable}</td>
                <td>
                  <button className="btn btn-warning btn-sm"
                    onClick={() => navigate(`/invoices/edit/${inv.id}`)}>
                    Edit
                  </button>
                </td>
                <td>
                  <button className="btn btn-danger btn-sm"
                    onClick={() => setDeleteTarget(inv.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Delete Modal */}
        {deleteTarget && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete this invoice?
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary"
                    onClick={() => setDeleteTarget(null)}>Cancel</button>
                  <button className="btn btn-danger"
                    onClick={handleDelete}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CREATE INVOICE (triggered from Estimates)
// ─────────────────────────────────────────────
export function CreateInvoice() {
  const { estimatedId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    estimatedId: '',
    chainId: '',
    serviceDetails: '',
    qty: '',
    costPerQty: '',
    amountPayable: '',
    amountPaid: '',
    balance: '',
    dateOfService: '',
    deliveryDetails: '',
    emailId: '',
  });
  const [invoiceNo] = useState('Auto Generated');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Prefill from estimate
    const fetchEstimate = async () => {
      try {
        const res = await fetch(
          `https://mis-invoicing-backend.onrender.com/api/estimates/${estimatedId}`
        );
        const est = await res.json();
        const amtPaid = est.totalCost || 0;
        setForm({
          estimatedId: est.estimatedId,
          chainId: est.chainId,
          serviceDetails: est.service || '',
          qty: est.qty,
          costPerQty: est.costPerUnit,
          amountPayable: est.totalCost,
          amountPaid: amtPaid,
          balance: 0,
          dateOfService: est.deliveryDate || '',
          deliveryDetails: est.deliveryDetails || '',
          emailId: '',
        });
      } catch (e) {
        setError('Failed to fetch estimate details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEstimate();
  }, [estimatedId]);

  const handleSubmit = async () => {
    if (!form.emailId) {
      setError('Email ID is required.');
      return;
    }
    const payload = {
      estimatedId: form.estimatedId,
      chainId: form.chainId,
      serviceDetails: form.serviceDetails,
      qty: Number(form.qty),
      costPerQty: Number(form.costPerQty),
      amountPayable: Number(form.amountPayable),
      balance: Number(form.balance),
      dateOfPayment: new Date().toISOString().slice(0, 19).replace('T', ' '),
      dateOfService: form.dateOfService,
      deliveryDetails: form.deliveryDetails,
      emailId: form.emailId,
    };
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.text();
        setError(err);
        return;
      }
      navigate('/invoices');
    } catch (e) {
      setError('Failed to generate invoice.');
    }
  };

  if (loading) return <div className="text-center mt-5">Loading estimate data...</div>;

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="container mt-4">
        <h4 className="mb-4">Create Invoice Section</h4>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row g-3">
          {/* Row 1 */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">Invoice No:</label>
            <input className="form-control" value={invoiceNo} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Estimate ID:</label>
            <input className="form-control" value={form.estimatedId} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Chain ID:</label>
            <input className="form-control" value={form.chainId} disabled />
          </div>

          {/* Row 2 */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">Service Provided:</label>
            <input className="form-control" value={form.serviceDetails} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Quantity:</label>
            <input className="form-control" value={form.qty} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Cost per Quantity:</label>
            <input className="form-control" value={form.costPerQty} disabled />
          </div>

          {/* Row 3 */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">Amount Payable in Rs:</label>
            <input className="form-control" value={form.amountPayable} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Amount Paid in Rs:</label>
            <input className="form-control" value={form.amountPaid} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Balance in Rs:</label>
            <input className="form-control" value={form.balance} disabled />
          </div>

          {/* Row 4 */}
          <div className="col-md-4">
            <label className="form-label fw-semibold">Delivery Date:</label>
            <input className="form-control" value={form.dateOfService} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Other Delivery Details:</label>
            <textarea className="form-control" value={form.deliveryDetails} disabled rows={3} />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Enter Email ID:</label>
            <input
              className="form-control"
              placeholder="xyz@gmail.com"
              value={form.emailId}
              onChange={(e) => setForm({ ...form, emailId: e.target.value })}
            />
          </div>
        </div>

        <button className="btn btn-primary mt-4" onClick={handleSubmit}>
          Generate Invoice
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// EDIT INVOICE (email only)
// ─────────────────────────────────────────────
export function EditInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [emailId, setEmailId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      const res = await fetch(`${API}/${id}`);
      const data = await res.json();
      setForm(data);
      setEmailId(data.emailId || '');
    };
    fetchInvoice();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${API}/${id}/email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId }),
      });
      if (!res.ok) throw new Error();
      navigate('/invoices');
    } catch {
      setError('Failed to update invoice.');
    }
  };

  if (!form) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="container mt-4">
        <h4 className="mb-4">Update Invoice Section</h4>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Invoice No:</label>
            <input className="form-control" value={form.invoiceNo} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Estimate ID:</label>
            <input className="form-control" value={form.estimatedId} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Chain ID:</label>
            <input className="form-control" value={form.chainId} disabled />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Service Provided:</label>
            <input className="form-control" value={form.serviceDetails} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Quantity:</label>
            <input className="form-control" value={form.qty} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Cost per Quantity:</label>
            <input className="form-control" value={form.costPerQty} disabled />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Amount Payable in Rs:</label>
            <input className="form-control" value={form.amountPayable} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Amount Paid in Rs:</label>
            <input className="form-control" value={form.amountPayable} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Balance in Rs:</label>
            <input className="form-control" value={form.balance} disabled />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Delivery Date:</label>
            <input className="form-control" value={form.dateOfService || ''} disabled />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Other Delivery Details:</label>
            <textarea className="form-control" value={form.deliveryDetails || ''} disabled rows={3} />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Enter Email ID:</label>
            <input
              className="form-control"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
            />
          </div>
        </div>

        <button className="btn btn-primary mt-4" onClick={handleUpdate}>
          Update Invoice
        </button>
      </div>
    </div>
  );
}
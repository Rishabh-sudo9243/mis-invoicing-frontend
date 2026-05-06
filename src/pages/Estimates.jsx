import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";

const API = "https://mis-invoicing-backend.onrender.com/api";

// ─── Helpers ────────────────────────────────────────────────
const fetchJSON = (url) => fetch(url).then((r) => r.json());

// ════════════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════════════
export function EstimatesDashboard() {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filterBrand, setFilterBrand] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [brands, setBrands] = useState([]);
  const [groups, setGroups] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [est, count, br, gr] = await Promise.all([
        fetchJSON(`${API}/estimates`),
        fetchJSON(`${API}/estimates/count`),
        fetchJSON(`${API}/brands`),
        fetchJSON(`${API}/groups`),
      ]);
      setEstimates(Array.isArray(est) ? est : []);
      setTotalCount(count);
      setBrands(Array.isArray(br) ? br : []);
      setGroups(Array.isArray(gr) ? gr : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`${API}/estimates/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      loadData();
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  };

  const filtered = estimates.filter((e) => {
    return (
      (!filterBrand || e.brandName === filterBrand) &&
      (!filterGroup || e.groupName === filterGroup)
    );
  });

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-secondary mb-0">| Manage Estimate Section</h5>
          <span>Hi User | <a href="#">Logout</a></span>
        </div>

        {/* Stat Card */}
        <div className="row mb-3">
          <div className="col-md-3">
            <div className="card text-white bg-danger p-3">
              <div className="fw-bold">Total Estimates</div>
              <div className="fs-2 fw-bold">{totalCount}</div>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <button
          className="btn btn-success mb-3"
          onClick={() => navigate("/estimates/create")}
        >
          + Create Estimate
        </button>

        {/* Filters */}
        <div className="row mb-3">
          <div className="col-md-3">
            <select
              className="form-select"
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
            >
              <option value="">Filter by Brand</option>
              {brands.map((b) => (
                <option key={b.brandId} value={b.brandName}>
                  {b.brandName}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
            >
              <option value="">Filter by Group</option>
              {groups.map((g) => (
                <option key={g.groupId} value={g.groupName}>
                  {g.groupName}
                </option>
              ))}
            </select>
          </div>
          {(filterBrand || filterGroup) && (
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => { setFilterBrand(""); setFilterGroup(""); }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>Sr.No</th>
                  <th>Group</th>
                  <th>Chain ID</th>
                  <th>Brand</th>
                  <th>Zone</th>
                  <th>Service Details</th>
                  <th>Total Units</th>
                  <th>Price Per Unit</th>
                  <th>Total</th>
                  <th>Edit</th>
                  <th>Delete</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                      <td colSpan={12} className="text-center text-muted">
                      No estimates found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((est, idx) => (
                    <tr key={est.estimatedId}>
                      <td>{idx + 1}</td>
                      <td>{est.groupName}</td>
                      <td>{est.chainId}</td>
                      <td>{est.brandName}</td>
                      <td>{est.zoneName}</td>
                      <td>{est.service}</td>
                      <td>{est.qty}</td>
                      <td>{est.costPerUnit}</td>
                      <td>{est.totalCost}</td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => navigate(`/estimates/edit/${est.estimatedId}`)}
                        >
                          Edit
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteId(est.estimatedId)}
                        >
                          Delete
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-info btn-sm text-white"
                          onClick={() => navigate(`/invoices/create/${est.estimatedId}`)}
                        >
                          Generate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="modal d-block" style={{ background: "rgba(0,0,0,0.4)" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete this estimate? This action cannot be undone.
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete}>
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  CREATE / EDIT FORM  (shared component)
// ════════════════════════════════════════════════════════════
export function EstimateForm({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const emptyForm = {
    chainId: "",
    groupName: "",
    brandName: "",
    zoneName: "",
    service: "",
    qty: "",
    costPerUnit: "",
    totalCost: "",
    deliveryDate: "",
    deliveryDetails: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [groups, setGroups] = useState([]);
  const [chains, setChains] = useState([]);
  const [brands, setBrands] = useState([]);
  const [zones, setZones] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load dropdowns
    Promise.all([
      fetchJSON(`${API}/groups`),
      fetchJSON(`${API}/chains`),
      fetchJSON(`${API}/brands`),
      fetchJSON(`${API}/zones`),
    ]).then(([gr, ch, br, zo]) => {
      setGroups(Array.isArray(gr) ? gr : []);
      setChains(Array.isArray(ch) ? ch : []);
      setBrands(Array.isArray(br) ? br : []);
      setZones(Array.isArray(zo) ? zo : []);
    });

    // If edit mode — prefill
    if (mode === "edit" && id) {
      fetchJSON(`${API}/estimates/${id}`).then((est) => {
        setForm({
          chainId: est.chainId || "",
          groupName: est.groupName || "",
          brandName: est.brandName || "",
          zoneName: est.zoneName || "",
          service: est.service || "",
          qty: est.qty || "",
          costPerUnit: est.costPerUnit || "",
          totalCost: est.totalCost || "",
          deliveryDate: est.deliveryDate || "",
          deliveryDetails: est.deliveryDetails || "",
        });
      });
    }
  }, [mode, id]);

  // Auto-calculate total cost
  useEffect(() => {
    const qty = parseFloat(form.qty);
    const cpu = parseFloat(form.costPerUnit);
    if (!isNaN(qty) && !isNaN(cpu)) {
      setForm((prev) => ({ ...prev, totalCost: (qty * cpu).toFixed(2) }));
    }
  }, [form.qty, form.costPerUnit]);

  const validate = () => {
    const e = {};
    if (!form.chainId)      e.chainId = "Chain is required";
    if (!form.groupName)    e.groupName = "Group is required";
    if (!form.brandName)    e.brandName = "Brand is required";
    if (!form.zoneName)     e.zoneName = "Zone is required";
    if (!form.service.trim()) e.service = "Service is required";
    if (!form.qty || form.qty <= 0) e.qty = "Valid quantity required";
    if (!form.costPerUnit || form.costPerUnit <= 0) e.costPerUnit = "Valid cost required";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        chainId: parseInt(form.chainId),
        qty: parseInt(form.qty),
        costPerUnit: parseFloat(form.costPerUnit),
        totalCost: parseFloat(form.totalCost),
      };
      const url = mode === "edit"
        ? `${API}/estimates/${id}`
        : `${API}/estimates`;
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Server error");
      navigate("/estimates");
    } catch (err) {
      alert("Failed to save estimate: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldErr = (name) =>
    errors[name] ? <div className="text-danger small">{errors[name]}</div> : null;

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-secondary">
            | {mode === "edit" ? "Update" : "Create"} Estimate
          </h5>
          <span>Hi User | <a href="#">Logout</a></span>
        </div>

        <div className="card p-4 shadow-sm" style={{ maxWidth: 900 }}>
          <div className="row g-3">
            {/* LEFT COLUMN */}
            <div className="col-md-6">
              {/* Group */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Select Group</label>
                <select name="groupName" className="form-select" value={form.groupName} onChange={handleChange}>
                  <option value="">-- Select Group --</option>
                  {groups.map((g) => (
                    <option key={g.groupId} value={g.groupName}>{g.groupName}</option>
                  ))}
                </select>
                {fieldErr("groupName")}
              </div>

              {/* Chain */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Select Chain ID or Company Name</label>
                <select name="chainId" className="form-select" value={form.chainId} onChange={handleChange}>
                  <option value="">-- Select Chain --</option>
                  {chains.map((c) => (
                    <option key={c.chainId} value={c.chainId}>
                      {c.chainName} (ID: {c.chainId})
                    </option>
                  ))}
                </select>
                {fieldErr("chainId")}
              </div>

              {/* Brand */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Select Brand</label>
                <select name="brandName" className="form-select" value={form.brandName} onChange={handleChange}>
                  <option value="">-- Select Brand --</option>
                  {brands.map((b) => (
                    <option key={b.brandId} value={b.brandName}>{b.brandName}</option>
                  ))}
                </select>
                {fieldErr("brandName")}
              </div>

              {/* Zone */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Select Zone</label>
                <select name="zoneName" className="form-select" value={form.zoneName} onChange={handleChange}>
                  <option value="">-- Select Zone --</option>
                  {zones.map((z) => (
                    <option key={z.zoneId} value={z.zoneName}>{z.zoneName}</option>
                  ))}
                </select>
                {fieldErr("zoneName")}
              </div>

              {/* Service */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Service Provided</label>
                <input
                  type="text"
                  name="service"
                  className="form-control"
                  placeholder="Enter Service"
                  value={form.service}
                  onChange={handleChange}
                />
                {fieldErr("service")}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="col-md-6">
              {/* Qty */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Total Quantity</label>
                <input
                  type="number"
                  name="qty"
                  className="form-control"
                  placeholder="Enter Total Qty"
                  value={form.qty}
                  onChange={handleChange}
                  min={1}
                />
                {fieldErr("qty")}
              </div>

              {/* Cost Per Unit */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Cost Per Quantity</label>
                <input
                  type="number"
                  name="costPerUnit"
                  className="form-control"
                  placeholder="Enter Cost Per Qty"
                  value={form.costPerUnit}
                  onChange={handleChange}
                  min={0}
                />
                {fieldErr("costPerUnit")}
              </div>

              {/* Total Cost — auto-calculated */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Estimated Amount in Rs.</label>
                <input
                  type="number"
                  name="totalCost"
                  className="form-control"
                  placeholder="Auto-calculated"
                  value={form.totalCost}
                  readOnly
                />
              </div>

              {/* Delivery Date */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Expected Delivery Date</label>
                <input
                  type="date"
                  name="deliveryDate"
                  className="form-control"
                  value={form.deliveryDate}
                  onChange={handleChange}
                />
              </div>

              {/* Delivery Details */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Other Delivery Details</label>
                <textarea
                  name="deliveryDetails"
                  className="form-control"
                  rows={4}
                  value={form.deliveryDetails}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-2">
            <button
              className="btn btn-success me-2"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : mode === "edit"
                ? "Update and Save Estimate"
                : "Create and Save Estimate"}
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/estimates")}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
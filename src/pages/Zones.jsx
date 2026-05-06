import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const API = "https://mis-invoicing-backend.onrender.com/api";

const Zones = () => {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────
  const [zones, setZones]       = useState([]);
  const [brands, setBrands]     = useState([]);
  const [counts, setCounts]     = useState({ groups: 0, chains: 0, brands: 0, zones: 0 });

  const [filterBrandId, setFilterBrandId]   = useState(null);
  const [filterChainId, setFilterChainId]   = useState(null);
  const [filterGroupId, setFilterGroupId]   = useState(null);

  // Unique lists for sidebar filters
  const [uniqueBrands,    setUniqueBrands]    = useState([]);
  const [uniqueCompanies, setUniqueCompanies] = useState([]);
  const [uniqueGroups,    setUniqueGroups]    = useState([]);

  // Form state
  const [view, setView]           = useState("dashboard"); // dashboard | add | edit
  const [zoneName, setZoneName]   = useState("");
  const [brandId, setBrandId]     = useState("");
  const [editId, setEditId]       = useState(null);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchAll = async () => {
    try {
      let url = `${API}/zones`;
      if (filterBrandId) url += `?brandId=${filterBrandId}`;
      else if (filterChainId) url += `?chainId=${filterChainId}`;
      else if (filterGroupId) url += `?groupId=${filterGroupId}`;

      const [zRes, bRes, gcRes, chRes, brRes, zCntRes] = await Promise.all([
        fetch(url),
        fetch(`${API}/brands`),
        fetch(`${API}/groups/count`),
        fetch(`${API}/chains/count`),
        fetch(`${API}/brands/count`),
        fetch(`${API}/zones/count`),
      ]);

      const zData    = await zRes.json();
      const bData    = await bRes.json();
      const gcData   = await gcRes.json();
      const chData   = await chRes.json();
      const brData   = await brRes.json();
      const zCntData = await zCntRes.json();

      setZones(zData);
      setBrands(bData);
      setCounts({
        groups: gcData.count,
        chains: chData.count,
        brands: brData.count,
        zones:  zCntData.count,
      });

      // Build sidebar filter lists from full zone list
      const allZones = await fetch(`${API}/zones`).then(r => r.json());
      setUniqueBrands([...new Map(allZones.map(z => [z.brandId, { id: z.brandId, name: z.brandName }])).values()]);
      setUniqueCompanies([...new Map(allZones.map(z => [z.chainId, { id: z.chainId, name: z.companyName }])).values()]);
      setUniqueGroups([...new Map(allZones.map(z => [z.groupId, { id: z.groupId, name: z.groupName }])).values()]);
    } catch (e) {
      console.error("Fetch error:", e);
    }
  };

  useEffect(() => { fetchAll(); }, [filterBrandId, filterChainId, filterGroupId]);

  // ── Handlers ───────────────────────────────────────────────
  const resetForm = () => { setZoneName(""); setBrandId(""); setEditId(null); setError(""); };

  const handleAdd = async () => {
    setError("");
    if (!zoneName.trim()) { setError("Zone name is required."); return; }
    if (zoneName.trim().length < 2) { setError("Zone name must be at least 2 characters."); return; }
    if (!brandId) { setError("Please select a brand."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/zones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneName: zoneName.trim(), brandId: parseInt(brandId) }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "Failed to add zone.");
        return;
      }
      resetForm();
      setView("dashboard");
      fetchAll();
    } catch (e) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (zone) => {
    setEditId(zone.zoneId);
    setZoneName(zone.zoneName);
    setBrandId(zone.brandId);
    setError("");
    setView("edit");
  };

  const handleUpdate = async () => {
    setError("");
    if (!zoneName.trim()) { setError("Zone name is required."); return; }
    if (zoneName.trim().length < 2) { setError("Zone name must be at least 2 characters."); return; }
    if (!brandId) { setError("Please select a brand."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/zones/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneName: zoneName.trim(), brandId: parseInt(brandId) }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "Failed to update zone.");
        return;
      }
      resetForm();
      setView("dashboard");
      fetchAll();
    } catch (e) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (zoneId) => {
    if (!window.confirm("Are you sure you want to delete this zone?")) return;
    try {
      await fetch(`${API}/zones/${zoneId}`, { method: "DELETE" });
      fetchAll();
      setView("dashboard");
    } catch (e) {
      alert("Failed to delete zone.");
    }
  };

  const applyFilter = (type, id) => {
    setFilterBrandId(null); setFilterChainId(null); setFilterGroupId(null);
    if (type === "brand")   setFilterBrandId(id);
    if (type === "chain")   setFilterChainId(id);
    if (type === "group")   setFilterGroupId(id);
  };

  const clearFilter = () => { setFilterBrandId(null); setFilterChainId(null); setFilterGroupId(null); };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar />

      <div className="flex-grow-1 p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Invoice | Manage Zone Section</h5>
          <span>Hi User | <a href="/login">Logout</a></span>
        </div>

        {/* Stat Cards */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total Groups", value: counts.groups, color: "#f0ad4e" },
            { label: "Total Chains", value: counts.chains, color: "#5bc0de" },
            { label: "Total Brands", value: counts.brands, color: "#5cb85c" },
            { label: "Total Zones",  value: counts.zones,  color: "#d9534f" },
          ].map((c) => (
            <div className="col-md-3" key={c.label}>
              <div className="p-3 text-white rounded shadow-sm" style={{ backgroundColor: c.color }}>
                <div className="fw-bold">{c.label}</div>
                <div className="fs-4 fw-bold">{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Add / Edit Form */}
        {(view === "add" || view === "edit") && (
          <div className="card p-4 mb-4 shadow-sm" style={{ maxWidth: 480 }}>
            <h6 className="fw-bold mb-3">{view === "add" ? "Add Zone" : "Update Zone"}</h6>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <div className="mb-3">
              <label className="fw-semibold">Enter Zone Name:</label>
              <input
                className="form-control mt-1"
                placeholder="Enter Zone Name"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                maxLength={50}
              />
            </div>

            <div className="mb-3">
              <label className="fw-semibold">Select Brand:</label>
              <select
                className="form-select mt-1"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
              >
                <option value="">-- Select Brand --</option>
                {brands.map((b) => (
                  <option key={b.brandId} value={b.brandId}>{b.brandName}</option>
                ))}
              </select>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={view === "add" ? handleAdd : handleUpdate}
                disabled={loading}
              >
                {loading ? "Saving..." : view === "add" ? "Add Zone" : "Update Brand"}
              </button>
              <button className="btn btn-secondary" onClick={() => { resetForm(); setView("dashboard"); }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Table + Sidebar Filters */}
        {view === "dashboard" && (
          <div className="d-flex gap-4">
            {/* Table */}
            <div className="flex-grow-1">
              <button className="btn btn-primary btn-sm mb-3" onClick={() => { resetForm(); setView("add"); }}>
                + Add Zone
              </button>

              {(filterBrandId || filterChainId || filterGroupId) && (
                <button className="btn btn-outline-secondary btn-sm mb-3 ms-2" onClick={clearFilter}>
                  ✕ Clear Filter
                </button>
              )}

              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Sr.No</th>
                    <th>Zone</th>
                    <th>Brand</th>
                    <th>Company</th>
                    <th>Group</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-muted">No zones found.</td></tr>
                  ) : (
                    zones.map((z, idx) => (
                      <tr key={z.zoneId}>
                        <td>{idx + 1}</td>
                        <td>{z.zoneName}</td>
                        <td>{z.brandName}</td>
                        <td>{z.companyName}</td>
                        <td>{z.groupName}</td>
                        <td>
                          <button className="btn btn-warning btn-sm" onClick={() => handleEdit(z)}>Edit</button>
                        </td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(z.zoneId)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Sidebar Filters */}
            <div style={{ minWidth: 180 }}>
              <div className="mb-3">
                <div className="fw-bold mb-1">Filter by Brand</div>
                {uniqueBrands.map((b) => (
                  <div
                    key={b.id}
                    className={`text-primary small mb-1 cursor-pointer ${filterBrandId === b.id ? "fw-bold" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => applyFilter("brand", b.id)}
                  >
                    {b.name}
                  </div>
                ))}
              </div>

              <div className="mb-3">
                <div className="fw-bold mb-1">Filter by Company</div>
                {uniqueCompanies.map((c) => (
                  <div
                    key={c.id}
                    className={`text-primary small mb-1 ${filterChainId === c.id ? "fw-bold" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => applyFilter("chain", c.id)}
                  >
                    {c.name}
                  </div>
                ))}
              </div>

              <div className="mb-3">
                <div className="fw-bold mb-1">Filter by Group</div>
                {uniqueGroups.map((g) => (
                  <div
                    key={g.id}
                    className={`text-primary small mb-1 ${filterGroupId === g.id ? "fw-bold" : ""}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => applyFilter("group", g.id)}
                  >
                    {g.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Zones;
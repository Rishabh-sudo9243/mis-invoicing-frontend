import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://mis-invoicing-backend.onrender.com/api";

export default function Brands() {
  const navigate = useNavigate();

  // ── Data ──────────────────────────────────────────────────────
  const [brands, setBrands]       = useState([]);
  const [chains, setChains]       = useState([]);
  const [groups, setGroups]       = useState([]);

  // ── Counts ────────────────────────────────────────────────────
  const [totalGroups, setTotalGroups]   = useState(0);
  const [totalChains, setTotalChains]   = useState(0);
  const [totalBrands, setTotalBrands]   = useState(0);

  // ── Filters ───────────────────────────────────────────────────
  const [filterChainId, setFilterChainId] = useState(null);
  const [filterGroupId, setFilterGroupId] = useState(null);

  // ── View State ────────────────────────────────────────────────
  const [view, setView] = useState("list"); // "list" | "add" | "edit"

  // ── Form ──────────────────────────────────────────────────────
  const [formBrandName, setFormBrandName] = useState("");
  const [formChainId, setFormChainId]     = useState("");
  const [editBrandId, setEditBrandId]     = useState(null);
  const [formError, setFormError]         = useState("");
  const [formSuccess, setFormSuccess]     = useState("");

  // ─────────────────────────────────────────────────────────────
  // Load on mount
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [bRes, cRes, gRes, gcRes, gbrRes] = await Promise.all([
        fetch(`${API}/brands`),
        fetch(`${API}/chains`),
        fetch(`${API}/groups`),
        fetch(`${API}/chains/count`),    // { totalChains: N }
        fetch(`${API}/brands/count`),    // { totalBrands: N }
      ]);

      const brandsData = await bRes.json();
      const chainsData = await cRes.json();
      const groupsData = await gRes.json();
      const chainCount = await gcRes.json();
      const brandCount = await gbrRes.json();

      setBrands(Array.isArray(brandsData) ? brandsData : []);
      setChains(Array.isArray(chainsData) ? chainsData : []);
      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setTotalChains(chainCount.totalChains ?? chainsData.length);
      setTotalBrands(brandCount.totalBrands ?? brandsData.length);
      setTotalGroups(groupsData.length);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Filtered brand list
  // ─────────────────────────────────────────────────────────────
  const displayedBrands = brands.filter((b) => {
    if (filterChainId && b.chainId !== filterChainId) return false;
    if (filterGroupId && b.groupId !== filterGroupId) return false;
    return true;
  });

  // ─────────────────────────────────────────────────────────────
  // Add Brand
  // ─────────────────────────────────────────────────────────────
  async function handleAdd(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formBrandName.trim()) {
      setFormError("Brand name is required.");
      return;
    }
    if (!formChainId) {
      setFormError("Please select a company.");
      return;
    }

    try {
      const res = await fetch(`${API}/brands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: formBrandName.trim(),
          chainId: parseInt(formChainId),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to add brand.");
        return;
      }
      setFormSuccess("Brand added successfully!");
      resetForm();
      fetchAll();
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch {
      setFormError("Server error. Please try again.");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Edit Brand
  // ─────────────────────────────────────────────────────────────
  function openEdit(brand) {
    setEditBrandId(brand.brandId);
    setFormBrandName(brand.brandName);
    setFormChainId(String(brand.chainId));
    setFormError("");
    setFormSuccess("");
    setView("edit");
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formBrandName.trim()) {
      setFormError("Brand name is required.");
      return;
    }
    if (!formChainId) {
      setFormError("Please select a company.");
      return;
    }

    try {
      const res = await fetch(`${API}/brands/${editBrandId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: formBrandName.trim(),
          chainId: parseInt(formChainId),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to update brand.");
        return;
      }
      setFormSuccess("Brand updated successfully!");
      resetForm();
      fetchAll();
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch {
      setFormError("Server error. Please try again.");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Delete Brand
  // ─────────────────────────────────────────────────────────────
  async function handleDelete(brandId) {
    if (!window.confirm("Are you sure you want to delete this brand?")) return;

    try {
      const res = await fetch(`${API}/brands/${brandId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Cannot delete this brand.");
        return;
      }
      fetchAll();
      navigate("/dashboard");
    } catch {
      alert("Server error. Please try again.");
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────
  function resetForm() {
    setFormBrandName("");
    setFormChainId("");
    setEditBrandId(null);
    setFormError("");
    setFormSuccess("");
  }

  function handleShowAdd() {
    resetForm();
    setView("add");
  }

  function handleCancel() {
    resetForm();
    setView("list");
  }

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="container-fluid">
      {/* ── Top Cards ── */}
      <div className="row mb-4 mt-3">
        <div className="col-md-3">
          <div className="card text-white bg-warning shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Total Groups</h6>
              <h3>{totalGroups}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Total Chains</h6>
              <h3>{totalChains}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Total Brands</h6>
              <h3>{totalBrands}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Forms ── */}
      {(view === "add" || view === "edit") && (
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  {view === "add" ? "Add Brand" : "Edit Brand"}
                </h5>

                {formError && (
                  <div className="alert alert-danger py-2">{formError}</div>
                )}
                {formSuccess && (
                  <div className="alert alert-success py-2">{formSuccess}</div>
                )}

                <form onSubmit={view === "add" ? handleAdd : handleUpdate}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Enter Brand Name:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Brand Name"
                      value={formBrandName}
                      onChange={(e) => setFormBrandName(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Select Company:
                    </label>
                    <select
                      className="form-select"
                      value={formChainId}
                      onChange={(e) => setFormChainId(e.target.value)}
                    >
                      <option value="">-- Select Company --</option>
                      {chains.map((c) => (
                        <option key={c.chainId} value={c.chainId}>
                          {c.companyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary me-2">
                    {view === "add" ? "Add Brand" : "Update"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── List View ── */}
      {view === "list" && (
        <div className="row">
          {/* Main Table */}
          <div className="col-md-9">
            <div className="mb-3">
              <button className="btn btn-primary" onClick={handleShowAdd}>
                + Add Brand
              </button>
            </div>

            <table className="table table-bordered table-hover shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th>Sr.No</th>
                  <th>Group</th>
                  <th>Company</th>
                  <th>Brand</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {displayedBrands.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
                      No brands found.
                    </td>
                  </tr>
                ) : (
                  displayedBrands.map((b, idx) => (
                    <tr key={b.brandId}>
                      <td>{idx + 1}</td>
                      <td>{b.groupName}</td>
                      <td>{b.companyName}</td>
                      <td>{b.brandName}</td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => openEdit(b)}
                        >
                          Edit
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(b.brandId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Sidebar Filters */}
          <div className="col-md-3">
            {/* Filter by Company */}
            <div className="card mb-3 shadow-sm">
              <div className="card-body">
                <h6 className="fw-bold">Filter by Company</h6>
                <ul className="list-unstyled mb-0">
                  <li>
                    <button
                      className={`btn btn-link p-0 text-decoration-none ${
                        filterChainId === null ? "fw-bold text-primary" : ""
                      }`}
                      onClick={() => {
                        setFilterChainId(null);
                        setFilterGroupId(null);
                      }}
                    >
                      All Companies
                    </button>
                  </li>
                  {chains.map((c) => (
                    <li key={c.chainId}>
                      <button
                        className={`btn btn-link p-0 text-decoration-none ${
                          filterChainId === c.chainId
                            ? "fw-bold text-primary"
                            : ""
                        }`}
                        onClick={() => {
                          setFilterChainId(c.chainId);
                          setFilterGroupId(null);
                        }}
                      >
                        {c.companyName}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Filter by Group */}
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="fw-bold">Filter by Group</h6>
                <ul className="list-unstyled mb-0">
                  <li>
                    <button
                      className={`btn btn-link p-0 text-decoration-none ${
                        filterGroupId === null && filterChainId === null
                          ? "fw-bold text-primary"
                          : ""
                      }`}
                      onClick={() => {
                        setFilterGroupId(null);
                        setFilterChainId(null);
                      }}
                    >
                      All Groups
                    </button>
                  </li>
                  {groups.map((g) => (
                    <li key={g.groupId}>
                      <button
                        className={`btn btn-link p-0 text-decoration-none ${
                          filterGroupId === g.groupId
                            ? "fw-bold text-primary"
                            : ""
                        }`}
                        onClick={() => {
                          setFilterGroupId(g.groupId);
                          setFilterChainId(null);
                        }}
                      >
                        {g.groupName}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
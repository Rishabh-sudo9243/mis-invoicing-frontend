import { useState, useEffect } from "react";
import API from "../services/api";

const Chains = () => {
  const [chains, setChains]         = useState([]);
  const [groups, setGroups]         = useState([]);
  const [filterGroupId, setFilterGroupId] = useState("");
  const [view, setView]             = useState("dashboard"); // dashboard | add | edit
  const [editingChain, setEditingChain]   = useState(null);
  const [form, setForm]             = useState({ companyName: "", gstnNo: "", groupId: "" });
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);

  // ── Fetch active groups for dropdown ─────────────────────────────────
  const fetchGroups = async () => {
    try {
      const res = await API.get("/groups");
      setGroups(res.data);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  // ── Fetch chains (optionally filtered by group) ───────────────────────
  const fetchChains = async (groupId = "") => {
    try {
      const url = groupId ? `/chains?groupId=${groupId}` : "/chains";
      const res = await API.get(url);
      setChains(res.data);
    } catch (err) {
      console.error("Failed to fetch chains", err);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchChains();
  }, []);

  // ── Filter handler ────────────────────────────────────────────────────
  const handleFilter = (groupId) => {
    setFilterGroupId(groupId);
    fetchChains(groupId);
  };

  // ── Form helpers ──────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({ companyName: "", gstnNo: "", groupId: "" });
    setError("");
    setEditingChain(null);
  };

  const goToDashboard = () => {
    resetForm();
    setView("dashboard");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // ── Validate form ─────────────────────────────────────────────────────
  const validate = () => {
    if (!form.companyName.trim()) { setError("Company name must not be empty"); return false; }
    if (!form.gstnNo.trim())      { setError("GSTN number must not be empty");  return false; }
    if (!form.groupId)            { setError("Please select a group");           return false; }
    return true;
  };

  // ── Add chain ─────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await API.post("/chains", {
        companyName: form.companyName.trim(),
        gstnNo: form.gstnNo.trim(),
        groupId: parseInt(form.groupId),
      });
      await fetchChains(filterGroupId);
      goToDashboard();
    } catch (err) {
      setError(err.response?.data || "Failed to add company");
    } finally {
      setLoading(false);
    }
  };

  // ── Update chain ──────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await API.put(`/chains/${editingChain.chainId}`, {
        companyName: form.companyName.trim(),
        gstnNo: form.gstnNo.trim(),
        groupId: parseInt(form.groupId),
      });
      await fetchChains(filterGroupId);
      goToDashboard();
    } catch (err) {
      setError(err.response?.data || "Failed to update company");
    } finally {
      setLoading(false);
    }
  };

  // ── Soft delete ───────────────────────────────────────────────────────
  const handleDelete = async (chainId) => {
    if (!window.confirm("Are you sure you want to deactivate this company?")) return;
    try {
      await API.delete(`/chains/${chainId}`);
      await fetchChains(filterGroupId);
    } catch (err) {
      alert(err.response?.data || "Cannot delete: company may be linked to a brand");
    }
  };

  // ── Open edit form ────────────────────────────────────────────────────
  const openEdit = (chain) => {
    setEditingChain(chain);
    setForm({
      companyName: chain.companyName,
      gstnNo: chain.gstnNo,
      groupId: chain.groupId,
    });
    setError("");
    setView("edit");
  };

  // ── Reusable form fields ──────────────────────────────────────────────
  const FormFields = () => (
    <div style={{ maxWidth: 450 }}>
      <label className="form-label fw-semibold">Enter Company Name:</label>
      <input
        type="text" name="companyName"
        className={`form-control mb-3 ${error && !form.companyName.trim() ? "is-invalid" : ""}`}
        placeholder="Enter Company Name"
        value={form.companyName}
        onChange={handleChange}
      />
      <label className="form-label fw-semibold">Enter GSTN:</label>
      <input
        type="text" name="gstnNo"
        className={`form-control mb-3 ${error && !form.gstnNo.trim() ? "is-invalid" : ""}`}
        placeholder="Enter GST Number"
        value={form.gstnNo}
        onChange={handleChange}
      />
      <label className="form-label fw-semibold">Select Group:</label>
      <select
        name="groupId"
        className={`form-select mb-3 ${error && !form.groupId ? "is-invalid" : ""}`}
        value={form.groupId}
        onChange={handleChange}
      >
        <option value="">-- Select Group --</option>
        {groups.map((g) => (
          <option key={g.groupId} value={g.groupId}>{g.groupName}</option>
        ))}
      </select>
      {error && (
        <div className="alert alert-danger py-1 px-2 mb-2">{error}</div>
      )}
    </div>
  );

  // ── ADD VIEW ──────────────────────────────────────────────────────────
  if (view === "add") {
    return (
      <div>
        <h4 className="mb-4">Add Company</h4>
        <FormFields />
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handleAdd} disabled={loading}>
            {loading ? "Adding..." : "Add Company"}
          </button>
          <button className="btn btn-secondary" onClick={goToDashboard}>Cancel</button>
        </div>
      </div>
    );
  }

  // ── EDIT VIEW ─────────────────────────────────────────────────────────
  if (view === "edit") {
    return (
      <div>
        <h4 className="mb-4">Edit Company</h4>
        <FormFields />
        <div className="d-flex gap-2">
          <button className="btn btn-warning" onClick={handleUpdate} disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </button>
          <button className="btn btn-secondary" onClick={goToDashboard}>Cancel</button>
        </div>
      </div>
    );
  }

  // ── DASHBOARD VIEW ────────────────────────────────────────────────────
  return (
    <div>
      {/* Stats cards */}
      <div className="d-flex gap-3 mb-4">
        <div className="card text-white bg-primary px-4 py-2" style={{ minWidth: 140 }}>
          <div className="small">Total Groups</div>
          <div className="fs-3 fw-bold">{groups.length}</div>
        </div>
        <div className="card text-white bg-success px-4 py-2" style={{ minWidth: 140 }}>
          <div className="small">Total Chains</div>
          <div className="fs-3 fw-bold">{chains.length}</div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-start mb-3">
        {/* Add button */}
        <button className="btn btn-success"
          onClick={() => { resetForm(); setView("add"); }}>
          + Add Company
        </button>

        {/* Filter by Group */}
        <div style={{ minWidth: 200 }}>
          <div className="fw-semibold mb-1 text-end">Filter by Group</div>
          <div
            className="border rounded p-2"
            style={{ maxHeight: 120, overflowY: "auto", cursor: "pointer" }}
          >
            <div
              className={`px-2 py-1 rounded mb-1 ${filterGroupId === "" ? "bg-primary text-white" : ""}`}
              onClick={() => handleFilter("")}
            >
              All Groups
            </div>
            {groups.map((g) => (
              <div
                key={g.groupId}
                className={`px-2 py-1 rounded mb-1 ${filterGroupId == g.groupId ? "bg-primary text-white" : ""}`}
                onClick={() => handleFilter(g.groupId)}
                style={{ cursor: "pointer" }}
              >
                {g.groupName}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chains table */}
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Sr. No</th>
            <th>Group Name</th>
            <th>Company</th>
            <th>GSTN</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {chains.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-muted">
                No companies found. Add one above.
              </td>
            </tr>
          ) : (
            chains.map((chain, index) => (
              <tr key={chain.chainId}>
                <td>{index + 1}</td>
                <td>{chain.groupName}</td>
                <td>{chain.companyName}</td>
                <td>{chain.gstnNo}</td>
                <td>
                  <button className="btn btn-warning btn-sm" onClick={() => openEdit(chain)}>
                    Edit
                  </button>
                </td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(chain.chainId)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Chains
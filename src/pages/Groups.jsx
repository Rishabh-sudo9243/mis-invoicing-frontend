
import { useState, useEffect } from "react";
import API from "../services/api";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [totalGroups, setTotalGroups] = useState(0);
  const [view, setView] = useState("dashboard");
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await API.get("/groups");
      setGroups(res.data);
      setTotalGroups(res.data.length);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const resetForm = () => {
    setGroupName("");
    setError("");
    setEditingGroup(null);
  };

  const goToDashboard = () => {
    resetForm();
    setView("dashboard");
  };

  const handleAdd = async () => {
    if (!groupName.trim()) {
      setError("Group name must not be empty");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await API.post("/groups", { groupName: groupName.trim() });
      await fetchGroups();
      goToDashboard();
    } catch (err) {
      setError(err.response?.data || "Failed to add group");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!groupName.trim()) {
      setError("Group name must not be empty");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await API.put(`/groups/${editingGroup.groupId}`, {
        groupName: groupName.trim(),
      });
      await fetchGroups();
      goToDashboard();
    } catch (err) {
      setError(err.response?.data || "Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm("Are you sure you want to deactivate this group?")) return;
    try {
      await API.delete(`/groups/${groupId}`);
      await fetchGroups();
    } catch (err) {
      alert(err.response?.data || "Cannot delete: group may be linked to a chain");
    }
  };

  const openEdit = (group) => {
    setEditingGroup(group);
    setGroupName(group.groupName);
    setError("");
    setView("edit");
  };


  if (view === "add") {
    return (
      <div>
        <h4 className="mb-4">Add Group</h4>
        <div style={{ maxWidth: 400 }}>
          <label className="form-label fw-semibold">Enter Group Name:</label>
          <input
            type="text"
            className={`form-control mb-2 ${error ? "is-invalid" : ""}`}
            placeholder="Enter Unique Group Name"
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value);
              setError("");
            }}
          />
          {error && (
            <div className="alert alert-danger py-1 px-2 mb-2" role="alert">
              {error}
            </div>
          )}
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Group"}
            </button>
            <button className="btn btn-secondary" onClick={goToDashboard}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "edit") {
    return (
      <div>
        <h4 className="mb-4">Edit Group Name</h4>
        <div style={{ maxWidth: 400 }}>
          <label className="form-label fw-semibold">Edit Group Name:</label>
          <input
            type="text"
            className={`form-control mb-2 ${error ? "is-invalid" : ""}`}
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value);
              setError("");
            }}
          />
          {error && (
            <div className="alert alert-danger py-1 px-2 mb-2" role="alert">
              {error}
            </div>
          )}
          <div className="d-flex gap-2">
            <button
              className="btn btn-warning"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
            <button className="btn btn-secondary" onClick={goToDashboard}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Total Groups card */}
      <div className="mb-4">
        <div
          className="card text-white bg-primary d-inline-block px-4 py-2"
          style={{ minWidth: 140 }}
        >
          <div className="small">Total Groups</div>
          <div className="fs-3 fw-bold">{totalGroups}</div>
        </div>
      </div>

      <button
        className="btn btn-success mb-3"
        onClick={() => {
          resetForm();
          setView("add");
        }}
      >
        + Add Group
      </button>

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Sr. No</th>
            <th>Group Name</th>
            <th>Status</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {groups.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                No groups found. Add one above.
              </td>
            </tr>
          ) : (
            groups.map((group, index) => (
              <tr key={group.groupId}>
                <td>{index + 1}</td>
                <td>{group.groupName}</td>
                <td>
                  <span
                    className={`badge ${
                      group.isActive ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {group.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => openEdit(group)}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(group.groupId)}
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
  );
};

export default Groups;
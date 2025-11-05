import React, { useEffect, useRef, useState } from "react";
import { getAllUsers, createUser, updateUser, deleteUser, adminResetPassword } from "../../api/users";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // will store stable id (id || _id || email)
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
    dept: "",
    uid: "",
  });
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [openActionId, setOpenActionId] = useState(null);
  const [menuFlipUp, setMenuFlipUp] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [resetPasswordModal, setResetPasswordModal] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [userStats, setUserStats] = useState({});

  const firstInputRef = useRef(null);
  const actionMenuRefs = useRef({});

  // ---------- helpers ----------
  const getStableId = (u) => {
    // prefer numeric id, fallback to _id, then to email (guaranteed unique)
    if (!u) return null;
    return u.id ?? u._id ?? u.email;
  };

  const normalizeUser = (u) => {
    if (!u) return u;
    const id = u.id ?? u._id ?? u.email;
    const _id = u._id ?? u.id ?? u.email;
    return { ...u, id, _id };
  };

  const getInitials = (u) => {
    const name = (u?.fullName || "").trim();
    if (name) {
      const parts = name.split(/\s+/);
      return parts
        .map((p) => (p && p[0] ? p[0].toUpperCase() : ""))
        .slice(0, 2)
        .join("");
    }
    // fallback to email letters
    const email = u?.email || "";
    return email.slice(0, 2).toUpperCase();
  };

  // ========================================
  // FETCH USERS WITH STATS
  // ========================================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getAllUsers({ search: query });
        // normalize users so we always have both id and _id
        const list = (response.data.users || []).map(normalizeUser);
        setUsers(list);

        // Fetch attendance stats for all users
        await fetchAttendanceStats(list);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert(error.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [query]);

  // ========================================
  // FETCH ATTENDANCE STATISTICS
  // ========================================
  const fetchAttendanceStats = async (usersList) => {
    try {
      const stats = {};

      for (const user of usersList) {
        const uid = getStableId(user);
        // Only fetch attendance for non-admin users
        if (user.role !== "admin") {
          try {
            const res = await fetch(`/api/attendance/user/${uid}/stats`, {
              credentials: "include",
            });

            if (res.ok) {
              const data = await res.json();
              stats[uid] = data.stats ?? { percentage: 0, present: 0, total: 0 };
            } else {
              // keep default if stats endpoint missing
              stats[uid] = { percentage: 0, present: 0, total: 0 };
            }
          } catch (err) {
            stats[uid] = { percentage: 0, present: 0, total: 0 };
          }
        } else {
          // For admin users, set empty stats
          stats[uid] = { percentage: 0, present: 0, total: 0 };
        }
      }

      setUserStats(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // ========================================
  // MODAL HELPERS
  // ========================================
  function openCreateModal() {
    setEditingId(null);
    setForm({
      fullName: "",
      email: "",
      password: "",
      role: "student",
      dept: "",
      uid: "",
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function openEditModal(user) {
    // store stable id (so update/delete uses same key)
    setEditingId(getStableId(user));
    setForm({
      fullName: user.fullName || "",
      email: user.email || "",
      password: "",
      role: user.role || "student",
      dept: user.dept || "",
      uid: user.uid || "",
    });
    setErrors({});
    setIsModalOpen(true);
  }

  function handleView(user) {
    setViewUser(normalizeUser(user));
  }

  // ========================================
  // CRUD HANDLERS
  // ========================================
  async function handleDelete(userId) {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;

    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => getStableId(u) !== userId));
      setOpenActionId(null);
      alert("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(error.response?.data?.message || "Failed to delete user");
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validate() {
    const err = {};
    if (!form.fullName.trim()) err.fullName = "Full name required";
    if (!form.email.trim()) err.email = "Email required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Invalid email";
    if (!editingId && !form.password.trim()) err.password = "Password required";
    if (!editingId && form.password.length < 6) err.password = "Password must be at least 6 characters";
    if (!form.role.trim()) err.role = "Role required";
    if (!form.uid.trim()) err.uid = "ID required";
    return err;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;

    setSubmitLoading(true);

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      role: form.role,
      dept: form.dept.trim(),
      uid: form.uid.trim(),
    };

    if (!editingId) {
      payload.password = form.password;
    }

    try {
      if (editingId) {
        const response = await updateUser(editingId, payload);
        const updated = normalizeUser(response.data.user);
        setUsers((prev) => prev.map((u) => (getStableId(u) === editingId ? updated : u)));
        alert("User updated successfully");
      } else {
        const response = await createUser(payload);
        const created = normalizeUser(response.data.user);
        setUsers((prev) => [created, ...prev]);
        alert("User created successfully");
      }

      setIsModalOpen(false);
      setEditingId(null);
    } catch (error) {
      console.error("Error saving user:", error);
      const errorMsg = error.response?.data?.message || "Failed to save user";
      const errorDetails = error.response?.data?.errors;

      if (errorDetails) {
        setErrors(errorDetails);
      } else {
        alert(errorMsg);
      }
    } finally {
      setSubmitLoading(false);
    }
  }

  // ========================================
  // PASSWORD RESET HANDLER
  // ========================================
  async function handlePasswordReset() {
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setSubmitLoading(true);
    try {
      await adminResetPassword({
        userId: getStableId(resetPasswordModal),
        newPassword: newPassword,
      });
      alert(`Password reset successful for ${resetPasswordModal.email}`);
      setResetPasswordModal(null);
      setNewPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
      alert(error.response?.data?.message || "Failed to reset password");
    } finally {
      setSubmitLoading(false);
    }
  }

  // ========================================
  // ACTION MENU POSITION LOGIC
  // ========================================
  function toggleActionMenu(userId, event) {
    event.stopPropagation();

    if (openActionId === userId) {
      setOpenActionId(null);
      return;
    }

    const btn = event.currentTarget;
    if (btn && typeof btn.getBoundingClientRect === "function") {
      const rect = btn.getBoundingClientRect();
      const estimatedMenuHeight = 150;
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldFlip = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;
      setMenuFlipUp(shouldFlip);
    } else {
      setMenuFlipUp(false);
    }

    setOpenActionId(userId);
  }

  // ========================================
  // KEYBOARD & CLICK HANDLERS
  // ========================================
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setViewUser(null);
        setOpenActionId(null);
        setResetPasswordModal(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 80);
    }
  }, [isModalOpen]);

  useEffect(() => {
    function onDocClick(e) {
      let clickedInsideMenu = false;
      Object.values(actionMenuRefs.current).forEach((ref) => {
        try {
          if (ref && ref.contains && ref.contains(e.target)) clickedInsideMenu = true;
        } catch (err) {
          // ignore stale refs
        }
      });
      if (!clickedInsideMenu) setOpenActionId(null);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // ========================================
  // GET PERCENTAGE COLOR AND ROLE BADGE STYLE
  // ========================================
  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return "text-green-600 font-bold";
    if (percentage >= 50) return "text-yellow-600 font-bold";
    return "text-red-600 font-bold";
  };

  const getRoleBadgeStyle = (role) => {
    if (role === "admin") {
      return "bg-black text-white";
    }
    return "bg-gray-100 text-gray-700";
  };

  // ========================================
  // RENDER ATTENDANCE CELL
  // ========================================
  const renderAttendanceCell = (user) => {
    const uid = getStableId(user);
    if (user.role === "admin") {
      return <div className="text-sm text-gray-500">-</div>;
    }

    const stats = userStats[uid] || { percentage: 0, present: 0, total: 0 };
    const percentage = stats.percentage || 0;

    return (
      <div>
        <div className={`text-lg ${getPercentageColor(percentage)}`}>{percentage.toFixed(0)}%</div>
        <p className="text-xs text-gray-500 mt-1">
          {stats.present}/{stats.total}
        </p>
      </div>
    );
  };

  // ========================================
  // RENDER MOBILE ATTENDANCE
  // ========================================
  const renderMobileAttendance = (user) => {
    const uid = getStableId(user);
    if (user.role === "admin") {
      return (
        <div className="mt-3 p-2 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">Attendance: -</div>
        </div>
      );
    }

    const stats = userStats[uid] || { percentage: 0, present: 0, total: 0 };
    const percentage = stats.percentage || 0;

    return (
      <div className="mt-3 p-2 bg-gray-50 rounded">
        <div className={`text-sm ${getPercentageColor(percentage)}`}>Attendance: {percentage.toFixed(0)}%</div>
        <p className="text-xs text-gray-500">{stats.present}/{stats.total} days</p>
      </div>
    );
  };

  // ========================================
  // FILTER USERS
  // ========================================
  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    const fullName = (u.fullName || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const uid = (u.uid || "").toLowerCase();
    const dept = (u.dept || "").toLowerCase();

    const matchesQuery = !q || fullName.includes(q) || email.includes(q) || uid.includes(q) || dept.includes(q);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesQuery && matchesRole;
  });

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="min-h-screen bg-[#f8f9fb] text-[#111827]">
      <main className="mx-3 sm:mx-6 mb-10 bg-white rounded-xl p-4 sm:p-6 shadow-md relative">
        {/* Add User (desktop) */}
        <button
          type="button"
          onClick={openCreateModal}
          className="hidden sm:inline-flex items-center gap-2 absolute top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition-shadow shadow-sm z-10"
          aria-label="Add user"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add User
        </button>

        <div className="mb-4">
          <h2 className="font-bold text-xl text-gray-900">User Management</h2>
          <p className="text-gray-600 text-sm">Manage students, teachers, and staff members</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <div className="relative flex-grow min-w-[160px]">
            <input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search by name, email, id or department..." className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-3 text-sm outline-none focus:ring-1 focus:ring-blue-500" aria-label="Search users" />
          </div>

          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by role" className="border border-gray-300 rounded-md py-2 px-3 text-sm bg-gray-50 text-gray-700 shrink-0">
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>

          {/* Mobile Add User */}
          <button onClick={openCreateModal} className="flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-800 transition sm:hidden" aria-label="Add user">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <>
            {/* Table for md+ */}
            <div className="overflow-x-auto">
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department / Class</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">No users found.</td>
                      </tr>
                    ) : (
                      filtered.map((u) => {
                        const stableId = getStableId(u);
                        return (
                          <tr key={stableId} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-sm">
                                  {getInitials(u)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{u.fullName || u.email}</div>
                                  <div className="text-xs text-gray-400">ID: {u.uid}</div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{u.email}</div>
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getRoleBadgeStyle(u.role)}`}>{u.role}</span>
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{u.dept || "-"}</div>
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              {renderAttendanceCell(u)}
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <div ref={(el) => (actionMenuRefs.current[stableId] = el)} className="relative inline-block">
                                <button onClick={(e) => toggleActionMenu(stableId, e)} aria-haspopup="true" aria-expanded={openActionId === stableId} className="inline-flex items-center p-2 rounded hover:bg-gray-100 focus:outline-none" title="Actions">
                                  <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                    <path d="M12 7a2 2 0 110-4 2 2 0 010 4zm0 7a2 2 0 110-4 2 2 0 010 4zm0 7a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>

                                {openActionId === stableId && (
                                  <div role="menu" className={`absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-30 dropdown-animation ${menuFlipUp ? "origin-bottom-right -translate-y-2" : ""}`} style={{ transformOrigin: menuFlipUp ? "bottom right" : undefined }}>
                                    <button onClick={() => { setOpenActionId(null); handleView(u); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2" role="menuitem">
                                      <span className="text-[14px]">👁</span> View Details
                                    </button>
                                    <button onClick={() => { setOpenActionId(null); openEditModal(u); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2" role="menuitem">
                                      <span className="text-[14px]">✏️</span> Edit
                                    </button>
                                    <button onClick={() => { setResetPasswordModal(normalizeUser(u)); setOpenActionId(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2" role="menuitem">
                                      <span className="text-[14px]">🔑</span> Reset Password
                                    </button>
                                    <button onClick={() => { handleDelete(stableId); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2" role="menuitem">
                                      <span className="text-[14px]">🗑</span> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Card view for small screens */}
              <div className="block md:hidden space-y-3">
                {filtered.length === 0 && <div className="text-center py-6 text-gray-500 text-sm">No users found.</div>}

                {filtered.map((u) => {
                  const stableId = getStableId(u);
                  return (
                    <article key={stableId} className="bg-white border rounded-lg shadow-sm p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-sm">{getInitials(u)}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{u.fullName || u.email}</h3>
                              <p className="text-xs text-gray-400">ID: {u.uid}</p>
                            </div>

                            <div className="flex items-center gap-1">
                              <span className={`text-xs px-2 py-1 rounded capitalize ${getRoleBadgeStyle(u.role)}`}>{u.role}</span>
                            </div>
                          </div>

                          <p className="text-xs text-gray-700 mt-2">{u.email}</p>
                          <p className="text-xs text-gray-700 mt-1"><strong>Dept:</strong> {u.dept || "-"}</p>

                          {/* Attendance - Conditionally rendered */}
                          {renderMobileAttendance(u)}

                          <div className="mt-3 flex justify-end gap-2">
                            <button onClick={() => handleView(u)} className="px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">View</button>
                            <button onClick={() => openEditModal(u)} className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">Edit</button>
                            <button onClick={() => handleDelete(stableId)} className="px-3 py-1 text-xs rounded bg-red-50 text-red-600 hover:bg-red-100">Delete</button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Add/Edit modal */}
      {isModalOpen && (
        <Modal
          form={form}
          firstInputRef={firstInputRef}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          errors={errors}
          editingId={editingId}
          submitLoading={submitLoading}
          onClose={() => {
            setIsModalOpen(false);
            setEditingId(null);
          }}
        />
      )}

      {/* View user modal */}
      {viewUser && <ViewModal user={viewUser} stats={userStats[getStableId(viewUser)]} onClose={() => setViewUser(null)} />}

      {/* Reset Password modal */}
      {resetPasswordModal && (
        <ResetPasswordModal
          user={resetPasswordModal}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          onSubmit={handlePasswordReset}
          submitLoading={submitLoading}
          onClose={() => {
            setResetPasswordModal(null);
            setNewPassword("");
          }}
        />
      )}

      {/* Styles */}
      <style>{`
        @keyframes modalIn {
          from { transform: translateY(6px) scale(.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .dropdown-animation {
          animation: dropdownIn 120ms ease-out forwards;
        }
        @keyframes dropdownIn {
          from { opacity: 0; transform: scale(0.98) translateY(-6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .origin-bottom-right {
          transform-origin: bottom right;
        }

        @media (max-width: 480px) {
          main { padding-left: 12px; padding-right: 12px; }
        }
      `}</style>
    </div>
  );
}

/* Add/Edit Modal */
function Modal({ form, firstInputRef, handleChange, handleSubmit, errors, editingId, submitLoading, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusable = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');

    function handleKey(e) {
      if (e.key !== "Tab") return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div ref={modalRef} className="relative z-50 w-full max-w-2xl mx-auto bg-white rounded-xl shadow-xl transform transition-all duration-150 max-h-[90vh] overflow-y-auto" style={{ animation: "modalIn 160ms ease-out forwards" }} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          <div className="mb-3">
            <h3 id="modal-title" className="text-lg font-semibold text-gray-900">{editingId ? "Edit User" : "Add New User"}</h3>
            <p className="text-sm text-gray-500 mt-1">Create or update a user account</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-700 block mb-1">Full name</label>
              <input ref={firstInputRef} name="fullName" value={form.fullName} onChange={handleChange} className={`w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 ${errors.fullName ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`} placeholder="e.g. Priya Patel" />
              {errors.fullName && <div className="text-xs text-red-500 mt-1">{errors.fullName}</div>}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Email</label>
              <input name="email" value={form.email} onChange={handleChange} className={`w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 ${errors.email ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`} placeholder="email@example.com" type="email" />
              {errors.email && <div className="text-xs text-red-500 mt-1">{errors.email}</div>}
            </div>

            {!editingId && (
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Password</label>
                <input name="password" value={form.password} onChange={handleChange} className={`w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 ${errors.password ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`} placeholder="Minimum 6 characters" type="password" />
                {errors.password && <div className="text-xs text-red-500 mt-1">{errors.password}</div>}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Role</label>
              <select name="role" value={form.role} onChange={handleChange} className={`w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 ${errors.role ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <div className="text-xs text-red-500 mt-1">{errors.role}</div>}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Department / Class</label>
              <input name="dept" value={form.dept} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 border-gray-300 focus:ring-blue-200" placeholder="e.g. Class 10 / Physics" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Employee / Student ID</label>
              <input name="uid" value={form.uid} onChange={handleChange} className={`w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 ${errors.uid ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"}`} placeholder="e.g. STU-123 or EMP-001" />
              {errors.uid && <div className="text-xs text-red-500 mt-1">{errors.uid}</div>}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} disabled={submitLoading} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition">Cancel</button>
            <button type="submit" disabled={submitLoading} className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 transition shadow disabled:opacity-50">{submitLoading ? "Saving..." : editingId ? "Save Changes" : "Add User"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* View Modal */
function ViewModal({ user, stats, onClose }) {
  const getRoleBadgeStyle = (role) => {
    if (role === "admin") {
      return "bg-black text-white";
    }
    return "bg-gray-100 text-gray-700";
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const percentage = stats?.percentage || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-50 w-full max-w-md mx-auto bg-white rounded-xl shadow-xl p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
        <p className="text-sm text-gray-500 mb-4">User details</p>

        <div className="text-sm text-gray-700 space-y-3">
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Role:</strong> <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ml-2 capitalize ${getRoleBadgeStyle(user.role)}`}>{user.role}</span></div>
          <div><strong>Department / Class:</strong> {user.dept || "-"}</div>
          <div><strong>ID:</strong> {user.uid}</div>

          {user.role === "admin" ? (
            <div><strong>Attendance:</strong> -</div>
          ) : (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <strong>Attendance:</strong>
              <div className={`text-2xl font-bold ${getPercentageColor(percentage)} mt-2`}>{percentage.toFixed(0)}%</div>
              <p className="text-xs text-gray-500 mt-2">{stats?.present || 0} present / {stats?.total || 0} total days</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200">Close</button>
        </div>
      </div>
    </div>
  );
}

/* Reset Password Modal */
function ResetPasswordModal({ user, newPassword, setNewPassword, onSubmit, submitLoading, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-6" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-50 w-full max-w-md mx-auto bg-white rounded-xl shadow-xl p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">Reset password for <strong>{user.fullName}</strong> ({user.email})</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-200" />
          </div>
          <div className="flex gap-3">
            <button onClick={onSubmit} disabled={submitLoading} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 text-sm">{submitLoading ? "Resetting..." : "Reset Password"}</button>
            <button onClick={onClose} disabled={submitLoading} className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

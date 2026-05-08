import { LockOpen, RefreshCcw, ShieldCheck, Users as UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadUsers = async () => {
    setError("");
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateUser = async (id, payload) => {
    setError("");
    setNotice("");
    try {
      await api.put(`/users/${id}`, payload);
      setNotice("User updated successfully");
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const unlockUser = async (id) => {
    setError("");
    setNotice("");
    try {
      await api.patch(`/users/${id}/unlock`);
      setNotice("User unlocked successfully");
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Admin control</p>
        <h2 className="mt-1 text-2xl font-bold text-ink">User Management</h2>
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {notice ? <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Security</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isLocked = user.lockUntil && new Date(user.lockUntil) > new Date();
                return (
                  <tr key={user._id} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select className="field min-w-32" value={user.role} onChange={(event) => updateUser(user._id, { role: event.target.value })}>
                        <option value="agent">Agent</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button className="btn-secondary" type="button" onClick={() => updateUser(user._id, { isEmailVerified: !user.isEmailVerified })}>
                        <ShieldCheck size={15} />
                        {user.isEmailVerified ? "Verified" : "Verify"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <p className={isLocked ? "font-semibold text-red-600" : "text-slate-600"}>{isLocked ? "Locked" : "Active"}</p>
                      <p className="text-xs text-slate-500">{user.failedLoginAttempts || 0} failed attempts</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {isLocked ? (
                          <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={() => unlockUser(user._id)} aria-label="Unlock user">
                            <LockOpen size={15} />
                          </button>
                        ) : null}
                        <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={loadUsers} aria-label="Refresh users">
                          <RefreshCcw size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!users.length ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    <UsersIcon className="mx-auto mb-2 text-slate-300" />
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Users;

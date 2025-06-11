import React, { useEffect, useState } from "react";
import { UserPlus, Download, Eye } from "lucide-react";

// Define user type to avoid type issues
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  profile: string;
}

// Mock data for now
const fallbackUsers: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active", profile: "Profile details here" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Customer", status: "Inactive", profile: "Profile details here" },
  { id: 3, name: "Alice Johnson", email: "alice@example.com", role: "Customer", status: "Active", profile: "Profile details here" },
  { id: 4, name: "Bob Martin", email: "bob@example.com", role: "Manager", status: "Active", profile: "Profile details here" },
];

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(fallbackUsers);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Properly typed to User | null

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data || fallbackUsers);
      } catch (error) {
        console.error("Error fetching users, using fallback");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchRole = filterRole === "All" || user.role === filterRole;

    return matchSearch && matchRole;
  });

  const handleExport = () => {
    const headers = "Name,Email,Role,Status\n";
    const rows = users
      .map((u) => `"${u.name}","${u.email}","${u.role}","${u.status}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "user_management.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleStatusChange = (userId: number, status: string) => {
    // Ideally, send this to the backend to update the status of the user
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: status } : user
      )
    );
  };

  const openProfile = (user: User) => {
    setSelectedUser(user);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="text-orange-500 w-8 h-8" />
          <h1 className="text-3xl font-bold text-black">User Management</h1>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Customer">Customer</option>
            </select>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md shadow hover:bg-orange-600 transition"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading users...</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full text-left">
              <thead className="bg-orange-500/10 text-orange-500/90">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 text-black">{user.name}</td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4 text-gray-500">{user.role}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() =>
                          handleStatusChange(user.id, user.status === "Active" ? "Inactive" : "Active")
                        }
                        className="bg-yellow-500 text-white px-3 py-1 rounded-md"
                      >
                        {user.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(user.id, "Banned")
                        }
                        className="bg-red-600 text-white px-3 py-1 rounded-md"
                      >
                        Ban
                      </button>
                      <button
                        onClick={() => openProfile(user)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-xl font-bold mb-4">User Profile: {selectedUser.name}</h2>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <p><strong>Status:</strong> {selectedUser.status}</p>
            <p><strong>Profile:</strong> {selectedUser.profile}</p>
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-4 bg-gray-300 text-black px-4 py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

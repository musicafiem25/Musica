import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Display from "./Display"; // Adjust the import path as needed
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("admins");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDateAuth, setSearchDateAuth] = useState("");
  const [searchTermOthers, setSearchTermOthers] = useState("");
  const [searchDateOthers, setSearchDateOthers] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedUsers = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setUsers(sortedUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Unauthorized or server error",
      });
    }
  };

  const handleDelete = async (userId) => {
    const userToDelete = users.find((u) => u._id === userId);
    if (!userToDelete) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_BASE_URL}/api/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user._id !== userId));

      const currentUserEmail = localStorage.getItem("email");
      if (userToDelete.email === currentUserEmail) {
        await Swal.fire({
          icon: "info",
          title: "Account Deleted",
          text: "You deleted your own account. Logging out...",
        });
        localStorage.clear();
        window.location.href = "/";
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "User deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Failed to delete user:", err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete user.",
      });
    }
  };

  const admins = users.filter((u) => u.isAdmin);
  const authenticUsers = users.filter((u) => !u.isAdmin && u.googleId);
  const others = users.filter((u) => !u.isAdmin && !u.googleId);

  const dateMatches = (dateStr, search) => {
    if (!dateStr || !search) return true;
    return new Date(dateStr).toLocaleDateString().includes(search);
  };

  const filterUsers = (users, term, date) => {
    return users.filter((user) => {
      const nameMatch =
        (user.name?.toLowerCase().includes(term.toLowerCase()) ||
          user.email?.toLowerCase().includes(term.toLowerCase()));
      const dateMatch =
        dateMatches(user.createdAt, date) || dateMatches(user.updatedAt, date);
      return nameMatch && dateMatch;
    });
  };

  const filteredAuthenticUsers = filterUsers(authenticUsers, searchTerm, searchDateAuth);
  const filteredOthers = filterUsers(others, searchTermOthers, searchDateOthers);

  const renderInput = (value, onChange, placeholder) => (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="px-4 py-2 border rounded-md min-w-[250px] text-sm"
    />
  );

  const renderTable = (userList, isAdminTable = false) => (
    <div className="overflow-auto bg-gray-300 rounded-lg shadow max-h-[600px] mt-4">
      <table className="min-w-[1000px] w-full border-collapse">
        <thead className="sticky top-0 bg-gray-100 text-gray-700 text-sm">
          <tr>
            {!isAdminTable && <th className="py-2 px-3">S.NO.</th>}
            <th className="py-2 px-3">Avatar</th>
            <th className="py-2 px-3">Name</th>
            <th className="py-2 px-3">Email</th>
            {!isAdminTable && <th className="py-2 px-3">Google ID</th>}
            <th className="py-2 px-3">Liked</th>
            <th className="py-2 px-3">Pinned</th>
            <th className="py-2 px-3">Recent</th>
            <th className="py-2 px-3">Created</th>
            <th className="py-2 px-3">Updated</th>
            {!isAdminTable && <th className="py-2 px-3">Actions</th>}
          </tr>
        </thead>
        <tbody className="text-center text-sm">
          {userList.map((u, i) => (
            <tr key={u._id} className="hover:bg-gray-50">
              {!isAdminTable && <td className="py-2 px-3">{i + 1}</td>}
              <td className="py-2 px-3">
                {isAdminTable ? (
                  <img src="/tlogo.png" alt="Admin" className="w-10 h-10 rounded-full object-cover mx-auto" />
                ) : u.avatar?.url ? (
                  <img src={u.avatar.url} alt={u.name} className="w-10 h-10 rounded-full object-cover mx-auto" />
                ) : "N/A"}
              </td>
              <td className="py-2 px-3">{u.name || "N/A"}</td>
              <td className="py-2 px-3">{u.email || "N/A"}</td>
              {!isAdminTable && <td className="py-2 px-3">{u.googleId || "N/A"}</td>}
              <td className="py-2 px-3">{u.likedMusic?.length || 0}</td>
              <td className="py-2 px-3">{u.pinnedMusic?.length || 0}</td>
              <td className="py-2 px-3">{u.recentlyPlayed?.length || 0}</td>
              <td className="py-2 px-3">{new Date(u.createdAt).toLocaleString()}</td>
              <td className="py-2 px-3">{new Date(u.updatedAt).toLocaleString()}</td>
              {!isAdminTable && (
                <td className="py-2 px-3">
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
    <div className="flex flex-col min-h-screen bg-black mb-20 text-white font-sans">
      <main className="flex-1 p-4  text-black overflow-auto">
        <nav className="mb-4 flex flex-col items-center gap-4">
          <h1 className="text-3xl font-semibold text-teal-500 p-2 rounded-md text-center">
            Admin Dashboard
          </h1>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="text-sm px-3 py-2 rounded-md bg-slate-700 text-white border border-slate-600 focus:outline-none"
          >
            <option value="admins">Admin</option>
            <option value="authentic">Authentic Users</option>
            <option value="others">Others</option>
          </select>
        </nav>

        <h3 className="text-lg text-slate-400 mb-2">
          Total Users: {users.length - admins.length}
        </h3>

        {activeTab === "admins" && (
          <>
            <h2 className="text-xl font-bold text-teal-500 mb-2">Admin Account</h2>
            {admins.length > 0 ? renderTable(admins, true) : <p>No admin accounts found.</p>}
          </>
        )}

        {activeTab === "authentic" && (
          <>
            <h2 className="text-xl font-bold text-teal-500 mb-2">Authentic Users (Google ID)</h2>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {renderInput(searchTerm, (e) => setSearchTerm(e.target.value), "Search by name or email")}
              {renderInput(searchDateAuth, (e) => setSearchDateAuth(e.target.value), "Search by date (e.g., 5/17/2025)")}
            </div>
            {filteredAuthenticUsers.length > 0 ? renderTable(filteredAuthenticUsers) : <p>No authentic users found.</p>}
          </>
        )}

        {activeTab === "others" && (
          <>
            <h2 className="text-xl font-bold text-teal-500 mb-2">Others (No Google ID)</h2>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {renderInput(searchTermOthers, (e) => setSearchTermOthers(e.target.value), "Search by name or email")}
              {renderInput(searchDateOthers, (e) => setSearchDateOthers(e.target.value), "Search by date (e.g., 5/17/2025)")}
            </div>
            {filteredOthers.length > 0 ? renderTable(filteredOthers) : <p>No other users found.</p>}
          </>
        )}

     </main>
     
    </div>
    <div className="fixed bottom-0 left-0 w-full bg-[#1e1e1e] text-white border-gray-300 ">
        <Display />
      </div> 
    </>
  );
};

export default AdminDashboard;
"use client";

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import axios from "axios";

const ManageUsers = () => {
    interface User {
        _id: string;
        name: string;
        email: string;
        status: string;
        role: string;
        phone: string;
    }

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editData, setEditData] = useState({ name: "", email: "", status: "" });

    // Fetch all PLK users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/Users/getPolmgr"); // Adjust API route if needed
            setUsers(data.plkUsers);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error(error);
            toast.error("Failed to fetch users!");
        }
    };

    // Delete a user
    // const handleDelete = async (id: string) => {
    //     try {
    //         await axios.delete(`/api/Users/${id}`); // Adjust API route if needed
    //         setUsers(users.filter((user: any) => user._id !== id));
    //         toast.success("User deleted successfully!");
    //     } catch (error) {
    //         console.error(error);
    //         toast.error("Failed to delete user!");
    //     }
    // };

    // Handle editing
    const handleEdit = (id: string) => {
        const user = users.find((user: any) => user._id === id);
        if (user) {
            setEditingUser(user);
            setEditData({ name: user.name, email: user.email,  status: user.status });
        }
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };
    
    const handleEditSubmit = async () => {
        try {
            if (!editingUser) return;

            const { data } = await axios.put("/api/Users/updatePolmgr", {
                userId: editingUser._id,
                updatedData: editData,
            });

            // Update the user list with the updated user details
            setUsers(users.map((user: any) => (user._id === editingUser._id ? data.user : user)));
            setEditingUser(null);
            setEditData({ name: "", email: "",  status: "" });
            toast.success("User updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update user!");
        }
    };

    // Handle viewing (placeholder for now)
    const handleView = (id: string) => {
        toast.info(`View functionality for User ID: ${id} not implemented yet.`);
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    
    

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    <div className="container mx-auto px-6 py-8">
                        <ToastContainer position="top-right" autoClose={3000} />
                        <div className="w-full max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
                            <h1 className="text-3xl font-semibold text-gray-700 text-center mb-8">
                                Manage Polling Managers
                            </h1>
                            {loading ? (
                                <div className="text-center text-gray-700">Loading users...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-md text-left text-gray-700">
                                        <thead className="text-sm text-gray-900 uppercase bg-gray-300">
                                            <tr>
                                                <th className="px-6 py-4">ID</th>
                                                <th className="px-6 py-4">Name</th>
                                                <th className="px-6 py-4">Email</th>
                                                <th className="px-6 py-4">Phone</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user: any) => (
                                                <tr key={user._id} className="bg-white border-b hover:bg-gray-100">
                                                    <td className="px-6 py-4">{user._id}</td>
                                                    <td className="px-6 py-4">{user.name}</td>
                                                    <td className="px-6 py-4">{user.email}</td>
                                                    <td className="px-6 py-4">{user.phone}</td>
                                                    <td className="px-6 py-4">
                                                    <div>
        {user.status === "active" ? (
            <span className="text-green-600 font-semibold">Active</span>
        ) : (
            <span className="text-red-600 font-semibold">Inactive</span>
        )}
    </div>
                                                    </td>
                                                    
                                                    <td className="px-6 py-4 flex items-center justify-center gap-6">
    {/* Display Status */}
    

    {/* Toggle Button */}
    {/* <button
        onClick={() => handleToggleStatus(user._id, user.status)}
        className={`px-4 py-2 rounded ${
            user.status === "active"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
        }`}
    >
        {user.status === "active" ? "Deactivate" : "Activate"}
    </button> */}

    {/* Other Action Buttons */}
    {/* <button
        onClick={() => handleView(user._id)}
        className="text-blue-500 hover:text-blue-700 text-2xl"
    >
        <FaEye />
    </button> */}
    <button
        onClick={() => handleEdit(user._id)}
        className="text-yellow-500 hover:text-yellow-700 text-2xl"
    >
        <FaEdit />
    </button>
    {/* <button
        onClick={() => handleDelete(user._id)}
        className="text-red-500 hover:text-red-700 text-2xl"
    >
        <FaTrash />
    </button> */}
</td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Edit Modal */}
                    {editingUser && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                <h2 className="text-xl font-semibold mb-4">Edit User</h2>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editData.name}
                                        onChange={handleEditChange}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editData.email}
                                        onChange={handleEditChange}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>
                               
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={editData.status}
                                        onChange={handleSelectChange}
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <button
                                        onClick={() => setEditingUser(null)}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 rounded px-4 py-2"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEditSubmit}
                                        className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ManageUsers;

"use client"

import React, { useState } from "react"
import { FaEdit, FaTrash, FaEye } from "react-icons/fa"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"

// Hardcoded JSON Data
const initialUsers = [
    { id: 1, name: "John Doe", email: "john.doe@example.com", role: "plk" },
    { id: 2, name: "Jane Smith", email: "jane.smith@example.com", role: "plk" },
    { id: 3, name: "Mark Taylor", email: "mark.taylor@example.com", role: "plk" },
    { id: 4, name: "Lucy Brown", email: "lucy.brown@example.com", role: "plk"},
    { id: 5, name: "David Wilson", email: "david.wilson@example.com", role: "plk" },
    { id: 6, name: "Emily Clark", email: "emily.clark@example.com", role: "plk"},
    { id: 7, name: "Daniel Lee", email: "daniel.lee@example.com", role: "plk" },
]

const ManageUsers = () => {
    const [users, setUsers] = useState(initialUsers)

    const handleDelete = (id: number) => {
        setUsers(users.filter((user) => user.id !== id))
        toast.success("User deleted successfully!")
    }

    const handleEdit = (id: number) => {
        toast.info(`Edit functionality for User ID: ${id} not implemented yet.`)
    }

    const handleView = (id: number) => {
        toast.info(`View functionality for User ID: ${id} not implemented yet.`)
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    <div className="container mx-auto px-6 py-8">
                        <div className="bg-gray-100 flex flex-col items-center py-8">
                            <ToastContainer position="top-right" autoClose={3000} />
                            <div className="w-full max-w-6xl bg-white shadow-lg rounded-lg p-6">
                                <h1 className="text-3xl font-semibold text-gray-700 text-center mb-8">Manage Divisional Secretaries</h1>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-md text-left text-gray-700">
                                        <thead className="text-sm text-gray-900 uppercase bg-gray-300">
                                            <tr>
                                                <th scope="col" className="px-6 py-4">ID</th>
                                                <th scope="col" className="px-6 py-4">Name</th>
                                                <th scope="col" className="px-6 py-4">Email</th>
                                                <th scope="col" className="px-6 py-4">Role</th>
                                                <th scope="col" className="px-6 py-4 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id} className="bg-white border-b hover:bg-gray-100">
                                                    <td className="px-6 py-4 text-lg">{user.id}</td>
                                                    <td className="px-6 py-4 text-lg">{user.name}</td>
                                                    <td className="px-6 py-4 text-lg">{user.email}</td>
                                                    <td className="px-6 py-4 text-lg">{user.role}</td>
                                                    <td className="px-6 py-4 flex items-center justify-center gap-6">
                                                        <button
                                                            onClick={() => handleView(user.id)}
                                                            className="text-blue-500 hover:text-blue-700 text-2xl"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(user.id)}
                                                            className="text-yellow-500 hover:text-yellow-700 text-2xl"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="text-red-500 hover:text-red-700 text-2xl"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default ManageUsers

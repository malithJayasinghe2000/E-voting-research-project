"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GswForm = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "gsw",
        password: ""
    });

    const handleChange = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("/api/Users/route", {
            method: "POST",
            body: JSON.stringify({ formData }),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            const response = await res.json();
            toast.error(response.message || "Failed to create user. Please try again.");
        } else {
            toast.success("User created successfully!");
            router.refresh();
            router.push("/");
        }
    };

    return (
        <div className="flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-2xl font-semibold text-gray-700 text-center mb-6">Create Village Officer</h1>
                <form
                    onSubmit={handleSubmit}
                    method="post"
                    className="flex flex-col gap-6"
                >
                    {/* User Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-600 font-medium mb-1">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Enter full name"
                                onChange={handleChange}
                                required={true}
                                value={formData.name}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 font-medium mb-1">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter email address"
                                onChange={handleChange}
                                value={formData.email}
                                required={true}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>

                    {/* Role and Password */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-600 font-medium mb-1">Role</label>
                            <select
                                id="role"
                                name="role"
                                onChange={handleChange}
                                value={formData.role}
                                required={true}
                                disabled={true}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-200 text-gray-500 focus:outline-none"
                            >
                                <option value="gsw">Village Officer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-600 font-medium mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter password"
                                onChange={handleChange}
                                value={formData.password}
                                required={true}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>

                    {/* Dummy Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-600 font-medium mb-1">Phone Number</label>
                            <input
                                type="text"
                                placeholder="Enter phone number"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 font-medium mb-1">Address</label>
                            <input
                                type="text"
                                placeholder="Enter address"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-600 font-medium mb-1">Date of Birth</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 font-medium mb-1">NIC</label>
                            <input
                                type="text"
                                placeholder="Enter NIC number"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        Create User
                    </button>
                </form>
            </div>
           
        </div>
    );
};

export default GswForm;

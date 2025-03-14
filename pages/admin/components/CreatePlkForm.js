"use client"

import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const CreatePlkForm = () => {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "plk",
        district: "",
        local_council: "",
        password: "",
        phone: "",
        nationalId: "",
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const toastId = toast.loading("Submitting...")
        try {
            const res = await fetch("/api/Users/route", {
                method: "POST",
                body: JSON.stringify({ formData }),
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (!res.ok) {
                const response = await res.json()
                toast.update(toastId, {
                    render: response.message,
                    type: "error",
                    isLoading: false,
                    autoClose: 5000
                })
            } else {
                toast.update(toastId, {
                    render: "User created successfully!",
                    type: "success",
                    isLoading: false,
                    autoClose: 5000
                })
                router.refresh()
            }
        } catch (error) {
            toast.update(toastId, {
                render: "Something went wrong. Please try again.",
                type: "error",
                isLoading: false,
                autoClose: 5000
            })
        }
    }

    return (
        <div className="flex flex-col items-center justify-center  bg-gray-100">
            <ToastContainer position="top-right" autoClose={5000} />
            <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-3xl font-semibold text-center text-gray-700 mb-6">
                    Create Divisional Secretary
                </h1>
                <form onSubmit={handleSubmit} method="post" className="grid grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Enter full name"
                            onChange={handleChange}
                            value={formData.name}
                            required
                            className="w-full mt-2 px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            onChange={handleChange}
                            value={formData.email}
                            required
                            className="w-full mt-2 px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            onChange={handleChange}
                            value={formData.role}
                            required
                            className="w-full mt-2 px-4 py-2 text-sm border rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
                            disabled
                        >
                            <option value="plk">Divisional Secretary</option>
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            onChange={handleChange}
                            value={formData.password}
                            required
                            className="w-full mt-2 px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="local_council" className="block text-sm font-medium text-gray-700">
                            The Local Council
                        </label>
                        <input
                            id="local_council"
                            type="text"
                            name="local_council"
                            placeholder="Enter local council"
                            onChange={handleChange}
                            value={formData.local_council}
                            required
                            className="w-full mt-2 px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            type="text"
                            name="phone"
                            placeholder="Enter phone number"
                            onChange={handleChange}
                            value={formData.phone}
                            className="w-full mt-2 px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                            District
                        </label>
                        <input
                            id="district"
                            type="text"
                            name="district"
                            placeholder="Enter address"
                            onChange={handleChange}
                            value={formData.district}
                            required
                            className="w-full mt-2 px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    
                    <div>
                        <label
                            htmlFor="nationalId"
                            className="block text-sm font-medium text-gray-700"
                        >
                            National ID Number
                        </label>
                        <input
                            id="nationalId"
                            type="text"
                            name="nationalId"
                            placeholder="Enter National ID number"
                            onChange={handleChange}
                            value={formData.nationalId}
                            className="w-full mt-2 px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="col-span-2">
                        <button
                            type="submit"
                            className="w-full py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Create User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreatePlkForm

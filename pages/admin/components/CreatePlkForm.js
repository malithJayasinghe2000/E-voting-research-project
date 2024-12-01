"use client"

import { useRouter } from "next/navigation"
import React, { useState } from "react"

const CreatePlkForm = () => {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "plk",
        password: ""
    })
    const [errorMessage,setErrorMessage] = useState("")

    const handleChange = (e) => {
        const value = e.target.value
        const name = e.target.name
        setFormData((prevState)=>({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log(formData)
        setErrorMessage("")
        const res = await fetch("/api/Users/route", {
            method: "POST",
            body: JSON.stringify({formData}),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            const response = await res.json()
            setErrorMessage(response.message)
        } else {
            router.refresh()
            router.push("/")
        }
    }

    return (
        <>
        <form onSubmit={handleSubmit}
        method = "post"
        className="flex flex-col gap-3 w-1/2"
        >
            <h1>Create User</h1>
            <label>Full Name</label>
            <input
                id="name"
                type="text"
                name="name"
                placeholder="Name"
                onChange={handleChange}
                required={true}
                value={formData.name}
                className="m-2 bg-slate-400 rounded"
            />

            <label>Email</label>
            <input
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                value={formData.email}
                required={true}
                className="m-2 bg-slate-400 rounded"
            />

            <label>Role</label>
            <select
                id="role"
                name="role"
                onChange={handleChange}
                value={formData.role}
                required={true}
                className="m-2 bg-slate-400 rounded"
                disabled={true} 
            >
            
            <option value="plk">plk</option>
            </select>

            <label>Password</label>
            <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                value={formData.password}
                required={true}
                className="m-2 bg-slate-400 rounded"
            />
            <input type="submit" value="Create User" className="m-2 bg-blue-300 hover:bg-blue-100" />
        </form>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </>
        
    )

}

export default CreatePlkForm;

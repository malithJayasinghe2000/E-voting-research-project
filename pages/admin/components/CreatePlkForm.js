"use client"

import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiCreditCard, FiHome, FiUserCheck } from "react-icons/fi"

// District and local council data
const districtData = {
  "Colombo": ["Homagama", "Kaduwela", "Seethawaka"],
  "Gampaha": ["Kelaniya", "Biyagama", "Katana", "Minuwangoda", "Attanagalla", "Divulapitiya", "Mahara", "Ja-Ela", "Mirigama", "Gampaha"],
  "Kalutara": ["Bandaragama", "Agalawatta", "Mathugama", "Dodangoda", "Ingiriya", "Madurawala", "Millaniya", "Walallawita"],
  "Kandy": ["Pathahewaheta", "Kundasale", "Harispattuwa", "Udunuwara", "Yatinuwara", "Medadumbara", "Pasbage Korale", "Ganga Ihala Korale", "Ududumbara", "Panvila"],
  "Matale": ["Rattota", "Dambulla", "Ukuwela", "Yatawatta", "Naula", "Pallepola", "Ambanganga Korale", "Galewela", "Laggala-Pallegama", "Wilgamuwa"],
  "Nuwara Eliya": ["Ambagamuwa", "Kotmale", "Hanguranketha", "Walapane"],
  "Galle": ["Elpitiya", "Akmeemana", "Baddegama", "Habaraduwa", "Ambalangoda", "Karandeniya", "Nagoda", "Neluwa", "Imaduwa", "Yakkalamulla", "Gonapinuwala"],
  "Matara": ["Hakmana", "Devinuwara", "Weligama", "Malimbada", "Kirinda-Puhulwella", "Pasgoda", "Akuressa", "Kamburupitiya", "Thihagoda", "Athuraliya"],
  "Hambantota": ["Ambalantota", "Tissamaharama", "Lunugamvehera", "Weeraketiya", "Beliatta", "Okewela", "Angunakolapelessa", "Tangalle", "Walasmulla", "Katuwana"],
  "Jaffna": ["Velanai", "Karainagar", "Delft", "Nallur", "Kopay", "Chavakachcheri", "Point Pedro", "Sandilipay", "Tellippalai", "Kayts", "Uduvil", "Vadamarachchi East", "Vadamarachchi South-West"],
  "Kilinochchi": ["Karachchi", "Poonakary", "Pachchilaipalli"],
  "Mannar": ["Nanaddan", "Manthai West", "Musali", "Madhu"],
  "Vavuniya": ["Vavuniya South", "Vavuniya North", "Cheddikulam"],
  "Mullaitivu": ["Maritimepattu", "Oddusuddan", "Puthukkudiyiruppu", "Thunukkai", "Manthai East"],
  "Batticaloa": ["Eravur Pattu", "Koralaipattu", "Porativu Pattu", "Manmunai South & Eruvil Pattu", "Koralai Pattu West", "Koralai Pattu North", "Koralai Pattu Central", "Manmunai Pattu"],
  "Ampara": ["Maha Oya", "Damana", "Uhana", "Lahugala", "Dehiattakandiya", "Padiyathalawa"],
  "Trincomalee": ["Kinniya", "Seruvila", "Muttur", "Kuchchaveli", "Morawewa", "Gomarankadawala"],
  "Kurunegala": ["Panduwasnuwara", "Narammala", "Alawwa", "Mawathagama", "Rideegama", "Weerambugedara", "Bamunakotuwa", "Polgahawela", "Rasnayakapura", "Galgamuwa", "Giribawa", "Kotavehera", "Yapahuwa", "Ambanpola"],
  "Puttalam": ["Anamaduwa", "Nawagattegama", "Pallama", "Karuwalagaswewa", "Vanathavilluwa", "Mahakumbukkadawala"],
  "Anuradhapura": ["Galnewa", "Nochchiyagama", "Kahatagasdigiliya", "Thalawa", "Horowpothana", "Mihintale", "Nuwaragam Palatha East", "Nuwaragam Palatha Central", "Palagala"],
  "Polonnaruwa": ["Dimbulagala", "Lankapura", "Thamankaduwa", "Medirigiriya", "Hingurakgoda"],
  "Badulla": ["Bandarawela", "Haputale", "Ella", "Hali-Ela", "Passara", "Lunugala", "Welimada", "Uva Paranagama", "Haldummulla"],
  "Monaragala": ["Bibile", "Madulla", "Badalkumbura", "Wellawaya", "Thanamalwila", "Buttala", "Sewanagala"],
  "Ratnapura": ["Kalawana", "Ayagama", "Balangoda", "Opanayake", "Godakawela", "Weligepola", "Embilipitiya", "Kuruwita", "Eheliyagoda", "Elapatha"],
  "Kegalle": ["Ruwanwella", "Mawanella", "Warakapola", "Bulathkohupitiya", "Deraniyagala", "Yatiyantota", "Galigamuwa", "Aranayaka"]
};

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
    const [submitting, setSubmitting] = useState(false)
    const [formErrors, setFormErrors] = useState({})
    
    // Get available local councils based on selected district
    const availableLocalCouncils = formData.district ? districtData[formData.district] || [] : [];

    const handleChange = (e) => {
        const { name, value } = e.target
        
        // If district is changed, reset local_council value
        if (name === 'district') {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                local_council: "" // Reset local council when district changes
            }));
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [name]: value
            }));
        }
        
        // Clear error when field is edited
        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: ""
            }))
        }
    }

    const validateForm = () => {
        const errors = {}
        
        if (!formData.name.trim()) errors.name = "Name is required"
        if (!formData.email.trim()) errors.email = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid"
        if (!formData.password.trim()) errors.password = "Password is required"
        else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters"
        if (!formData.district.trim()) errors.district = "District is required"
        if (!formData.local_council.trim()) errors.local_council = "Local council is required"
        if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ""))) 
            errors.phone = "Please enter a valid phone number"
        if (!formData.nationalId.trim()) errors.nationalId = "National ID is required"
        
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) return
        
        setSubmitting(true)
        
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
                toast.error(response.message || "Failed to create user")
            } else {
                toast.success("Divisional Secretary created successfully!")
                // Reset form after successful submission
                setFormData({
                    name: "",
                    email: "",
                    role: "plk",
                    district: "",
                    local_council: "",
                    password: "",
                    phone: "",
                    nationalId: "",
                })
                router.refresh()
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800">Create Divisional Secretary</h2>
                <p className="text-sm text-gray-600 mt-1">Add a new Divisional Secretary to the system</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FiUser className="mr-2 text-gray-500" /> Full Name<span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className={`mt-1 relative rounded-md shadow-sm ${formErrors.name ? 'ring-1 ring-red-500' : ''}`}>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Enter full name"
                                onChange={handleChange}
                                value={formData.name}
                                className={`block w-full px-4 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            />
                        </div>
                        {formErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FiMail className="mr-2 text-gray-500" /> Email Address<span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className={`mt-1 relative rounded-md shadow-sm ${formErrors.email ? 'ring-1 ring-red-500' : ''}`}>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                onChange={handleChange}
                                value={formData.email}
                                className={`block w-full px-4 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            />
                        </div>
                        {formErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                        )}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FiUserCheck className="mr-2 text-gray-500" /> Role
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <select
                                id="role"
                                name="role"
                                onChange={handleChange}
                                value={formData.role}
                                disabled={true}
                                className="block w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 shadow-sm focus:outline-none"
                            >
                                <option value="plk">Divisional Secretary</option>
                            </select>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Role is fixed for this form</p>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FiLock className="mr-2 text-gray-500" /> Password<span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className={`mt-1 relative rounded-md shadow-sm ${formErrors.password ? 'ring-1 ring-red-500' : ''}`}>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Enter secure password"
                                onChange={handleChange}
                                value={formData.password}
                                className={`block w-full px-4 py-2 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            />
                        </div>
                        {formErrors.password && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FiMapPin className="mr-2 text-gray-500" /> District<span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className={`mt-1 relative rounded-md shadow-sm ${formErrors.district ? 'ring-1 ring-red-500' : ''}`}>
                            <select
                                id="district"
                                name="district"
                                onChange={handleChange}
                                value={formData.district}
                                className={`block w-full px-4 py-2 border ${formErrors.district ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            >
                                <option value="">Select district</option>
                                {Object.keys(districtData).map((district) => (
                                    <option key={district} value={district}>
                                        {district}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {formErrors.district && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.district}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FiHome className="mr-2 text-gray-500" /> Local Council<span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className={`mt-1 relative rounded-md shadow-sm ${formErrors.local_council ? 'ring-1 ring-red-500' : ''}`}>
                            <select
                                id="local_council"
                                name="local_council"
                                onChange={handleChange}
                                value={formData.local_council}
                                disabled={!formData.district} // Disable if no district is selected
                                className={`block w-full px-4 py-2 border ${formErrors.local_council ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!formData.district ? 'bg-gray-100' : ''}`}
                            >
                                <option value="">Select local council</option>
                                {availableLocalCouncils.map((council) => (
                                    <option key={council} value={council}>
                                        {council}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {formErrors.local_council && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.local_council}</p>
                        )}
                        {!formData.district && (
                            <p className="mt-1 text-xs text-gray-500">Please select a district first</p>
                        )}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FiPhone className="mr-2 text-gray-500" /> Phone Number
                        </label>
                        <div className={`mt-1 relative rounded-md shadow-sm ${formErrors.phone ? 'ring-1 ring-red-500' : ''}`}>
                            <input
                                id="phone"
                                type="text"
                                name="phone"
                                placeholder="Enter phone number"
                                onChange={handleChange}
                                value={formData.phone}
                                className={`block w-full px-4 py-2 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            />
                        </div>
                        {formErrors.phone && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <FiCreditCard className="mr-2 text-gray-500" /> National ID<span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className={`mt-1 relative rounded-md shadow-sm ${formErrors.nationalId ? 'ring-1 ring-red-500' : ''}`}>
                            <input
                                id="nationalId"
                                type="text"
                                name="nationalId"
                                placeholder="Enter national ID number"
                                onChange={handleChange}
                                value={formData.nationalId}
                                className={`block w-full px-4 py-2 border ${formErrors.nationalId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            />
                        </div>
                        {formErrors.nationalId && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.nationalId}</p>
                        )}
                    </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => router.push('/admin/dashboard')}
                        className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                        {submitting ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : "Create Divisional Secretary"}
                    </button>
                </div>
            </form>
            
            <ToastContainer position="top-right" autoClose={5000} />
        </div>
    )
}

export default CreatePlkForm

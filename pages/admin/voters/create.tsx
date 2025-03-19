import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { addEmployee } from "../../../utils/api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FiCamera, FiUser, FiCalendar, FiHome, FiMap, FiMapPin, FiHash, FiUsers, FiFileText, FiUserCheck } from "react-icons/fi";

const VoterRegistration: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    nic: "",
    birthday: "",
    gender: "",
    voterType: "",
    village: "",
    householdNo: "",
    gramaNiladariDivision: "",
    pollingDistrictNo: "",
    pollingDivision: "",
    electoralDistrict: "",
    relationshipToChief: "",
  });

  // Electoral districts in Sri Lanka
  const electoralDistricts = [
    "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya", 
    "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar", 
    "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee", 
    "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla", 
    "Monaragala", "Ratnapura", "Kegalle"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const captureImage = () => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  const retakeImage = () => {
    setCapturedImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!capturedImage) {
      setMessage({ text: "Please capture an image of the voter", type: 'error' });
      return;
    }

    // Validate required fields
    const requiredFields = Object.entries(formData).filter(([key, value]) => !value);
    if (requiredFields.length > 0) {
      setMessage({ 
        text: `Please fill in all required fields: ${requiredFields.map(([key]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())).join(", ")}`, 
        type: 'error' 
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await addEmployee({
        ...formData,
        image: capturedImage.split(",")[1], // Remove metadata
      });

      setMessage({ text: "Voter registration successful!", type: 'success' });
      
      // Reset form after successful submission
      setFormData({
        name: "",
        nic: "",
        birthday: "",
        gender: "",
        voterType: "",
        village: "",
        householdNo: "",
        gramaNiladariDivision: "",
        pollingDistrictNo: "",
        pollingDivision: "",
        electoralDistrict: "",
        relationshipToChief: "",
      });
      setCapturedImage(null);
      
    } catch (error: any) {
      setMessage({ text: error.message || "Failed to register voter", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Register New Voter</h1>
              <p className="text-sm text-gray-600 mt-1">Add a new voter to the electoral database with photo verification</p>
            </div>
            
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-50 border-l-4 border-green-500 text-green-700' :
                message.type === 'error' ? 'bg-red-50 border-l-4 border-red-500 text-red-700' :
                'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
              }`}>
                {message.text}
              </div>
            )}
            
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Voter Information</h2>
                <p className="text-sm text-gray-600">Enter all required details and capture a photo for identification</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Photo Capture */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                        <FiCamera className="mr-2" /> Voter Photo
                      </h3>
                      
                      <div className="aspect-w-4 aspect-h-5 overflow-hidden rounded-lg border-2 border-gray-300 mb-4">
                        {capturedImage ? (
                          <img 
                            src={capturedImage} 
                            alt="Captured" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Webcam 
                            audio={false}
                            ref={webcamRef} 
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover"
                            videoConstraints={{
                              width: 480,
                              height: 600,
                              facingMode: "user"
                            }}
                          />
                        )}
                      </div>
                      
                      <div className="flex justify-center">
                        {capturedImage ? (
                          <button
                            type="button"
                            onClick={retakeImage}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            Retake Photo
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={captureImage}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                          >
                            <FiCamera className="mr-2" /> Capture Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Columns - Form Fields */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                          <FiUser className="mr-2" /> Personal Information
                        </h3>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Full Name<span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter full name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">NIC Number<span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="nic"
                            value={formData.nic}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 951234567V"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date of Birth<span className="text-red-500">*</span></label>
                          <div className="flex items-center">
                            <FiCalendar className="text-gray-400 mr-2" />
                            <input
                              type="date"
                              name="birthday"
                              value={formData.birthday}
                              onChange={handleChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Gender<span className="text-red-500">*</span></label>
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Voter Type<span className="text-red-500">*</span></label>
                            <select
                              name="voterType"
                              value={formData.voterType}
                              onChange={handleChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                              <option value="">Select Type</option>
                              <option value="normal">Regular</option>
                              <option value="disable">Special Assistance</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Relationship to Chief Occupier</label>
                          <input
                            type="text"
                            name="relationshipToChief"
                            value={formData.relationshipToChief}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Self, Son, Daughter, Spouse"
                          />
                        </div>
                      </div>
                      
                      {/* Address & Electoral Information */}
                      <div className="space-y-4">
                        <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                          <FiMapPin className="mr-2" /> Address & Electoral Information
                        </h3>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Village/Town<span className="text-red-500">*</span></label>
                          <div className="flex items-center">
                            <FiHome className="text-gray-400 mr-2" />
                            <input
                              type="text"
                              name="village"
                              value={formData.village}
                              onChange={handleChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter village or town"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Household Number<span className="text-red-500">*</span></label>
                          <div className="flex items-center">
                            <FiHash className="text-gray-400 mr-2" />
                            <input
                              type="text"
                              name="householdNo"
                              value={formData.householdNo}
                              onChange={handleChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter household number"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Grama Niladari Division<span className="text-red-500">*</span></label>
                          <div className="flex items-center">
                            <FiMap className="text-gray-400 mr-2" />
                            <input
                              type="text"
                              name="gramaNiladariDivision"
                              value={formData.gramaNiladariDivision}
                              onChange={handleChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter Grama Niladari Division"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Electoral District<span className="text-red-500">*</span></label>
                          <select
                            name="electoralDistrict"
                            value={formData.electoralDistrict}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                          >
                            <option value="">Select Electoral District</option>
                            {electoralDistricts.map(district => (
                              <option key={district} value={district}>{district}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Polling Division<span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="pollingDivision"
                              value={formData.pollingDivision}
                              onChange={handleChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter polling division"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Polling District No.<span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="pollingDistrictNo"
                              value={formData.pollingDistrictNo}
                              onChange={handleChange}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter district number"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end">
                  <button
                    type="button"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>Register Voter</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VoterRegistration;
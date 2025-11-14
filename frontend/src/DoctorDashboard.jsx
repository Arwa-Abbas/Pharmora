import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Users,
  Calendar,
  Activity,
  LogOut,
  Home,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Plus,
  Eye,
  UserCheck,
} from "lucide-react";

function DoctorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  // Data states
  const [stats, setStats] = useState({});
  const [prescriptions, setPrescriptions] = useState([]);
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [doctorSpecialty, setDoctorSpecialty] = useState("");

  // Form states
  const [showCreatePrescription, setShowCreatePrescription] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    patient_id: "",
    diagnosis: "",
    notes: "",
    medicines: []
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user || user.role !== "Doctor") {
      navigate("/login");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load doctor's specialty first
      const specialtyRes = await fetch(`http://localhost:5000/api/doctor/${user.id}/specialty`);
      const specialtyData = await specialtyRes.json();
      setDoctorSpecialty(specialtyData.specialty);

      // Load statistics
      const statsRes = await fetch(`http://localhost:5000/api/doctor/${user.id}/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);

      // Load prescriptions issued by this doctor
      const presRes = await fetch(`http://localhost:5000/api/doctor/${user.id}/prescriptions`);
      const presData = await presRes.json();
      setPrescriptions(presData);

      // Load pending prescriptions assigned to this doctor
      const pendingRes = await fetch(`http://localhost:5000/api/doctor/pending-prescriptions/${user.id}`);
      const pendingData = await pendingRes.json();
      setPendingPrescriptions(pendingData);

      // Load doctor's patients (assigned patients and previous patients)
      const patientsRes = await fetch(`http://localhost:5000/api/doctor/${user.id}/patients`);
      const patientsData = await patientsRes.json();
      setPatients(patientsData);

      // Load medicines
      const medRes = await fetch(`http://localhost:5000/api/medicines`);
      const medData = await medRes.json();
      setMedicines(medData);
    } catch (err) {
      console.error("Error loading data:", err);
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const verifyPrescription = async (prescriptionId, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/doctor/verify-prescription/${prescriptionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctor_id: user.id,
            status: status,
            notes: status === "Rejected" ? "Prescription needs review" : "Verified by doctor"
          }),
        }
      );

      if (response.ok) {
        alert(`Prescription ${status.toLowerCase()} successfully!`);
        loadData();
      }
    } catch (err) {
      console.error("Error verifying prescription:", err);
      alert("Failed to verify prescription");
    }
  };

  const addMedicineToPrescription = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medicines: [
        ...prescriptionForm.medicines,
        { medicine_id: "", dosage: "", frequency: "", duration: "" }
      ]
    });
  };

  const updateMedicine = (index, field, value) => {
    const updatedMedicines = [...prescriptionForm.medicines];
    updatedMedicines[index][field] = value;
    setPrescriptionForm({ ...prescriptionForm, medicines: updatedMedicines });
  };

  const removeMedicine = (index) => {
    const updatedMedicines = prescriptionForm.medicines.filter((_, i) => i !== index);
    setPrescriptionForm({ ...prescriptionForm, medicines: updatedMedicines });
  };

  const createPrescription = async () => {
    if (!prescriptionForm.patient_id || !prescriptionForm.diagnosis) {
      alert("Please fill in patient and diagnosis");
      return;
    }

    if (prescriptionForm.medicines.length === 0) {
      alert("Please add at least one medicine");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/doctor/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: user.id,
          ...prescriptionForm
        }),
      });

      if (response.ok) {
        alert("Prescription created successfully!");
        setPrescriptionForm({
          patient_id: "",
          diagnosis: "",
          notes: "",
          medicines: []
        });
        setShowCreatePrescription(false);
        loadData();
      }
    } catch (err) {
      console.error("Error creating prescription:", err);
      alert("Failed to create prescription");
    }
  };

  const viewPatientHistory = async (patientId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/patient/${patientId}/prescriptions`);
      const data = await response.json();
      setPatientHistory(data);
      setSelectedPatient(patients.find(p => p.user_id === patientId));
      setActiveTab("patient-detail");
    } catch (err) {
      console.error("Error loading patient history:", err);
    }
  };

  const assignPatient = async (patientId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctor/${user.id}/assign-patient/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        alert("Patient assigned successfully!");
        loadData();
      }
    } catch (err) {
      console.error("Error assigning patient:", err);
      alert("Failed to assign patient");
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-blue-600 to-indigo-700 text-white flex flex-col">
        <div className="p-6 border-b border-blue-500">
          <h2 className="text-2xl font-bold">Pharmora</h2>
          <p className="text-sm text-blue-200 mt-1">Doctor Portal</p>
          {doctorSpecialty && (
            <p className="text-xs text-blue-300 mt-2">Specialty: {doctorSpecialty}</p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "overview" ? "bg-white text-blue-600" : "hover:bg-blue-500"
            }`}
          >
            <Activity size={20} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "prescriptions" ? "bg-white text-blue-600" : "hover:bg-blue-500"
            }`}
          >
            <FileText size={20} />
            <span>My Prescriptions</span>
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "pending" ? "bg-white text-blue-600" : "hover:bg-blue-500"
            }`}
          >
            <Clock size={20} />
            <span>Pending Verification</span>
            {pendingPrescriptions.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {pendingPrescriptions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("patients")}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === "patients" ? "bg-white text-blue-600" : "hover:bg-blue-500"
            }`}
          >
            <Users size={20} />
            <span>My Patients</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-500 transition"
          >
            <Home size={20} />
            <span>Home</span>
          </button>
        </nav>

        <div className="p-4 border-t border-blue-500">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-500 transition"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, Dr. {user?.name}!
          </h1>
          <p className="text-gray-600 mb-8">Manage your patients and prescriptions</p>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Prescriptions</p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">
                        {stats.total_prescriptions || 0}
                      </p>
                    </div>
                    <FileText className="text-blue-600" size={40} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Assigned Patients</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">
                        {stats.assigned_patients || 0}
                      </p>
                    </div>
                    <UserCheck className="text-green-600" size={40} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Patients</p>
                      <p className="text-3xl font-bold text-purple-600 mt-2">
                        {stats.total_patients || 0}
                      </p>
                    </div>
                    <Users className="text-purple-600" size={40} />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Pending Reviews</p>
                      <p className="text-3xl font-bold text-orange-600 mt-2">
                        {stats.pending_prescriptions || 0}
                      </p>
                    </div>
                    <Clock className="text-orange-600" size={40} />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-4">Recent Prescriptions</h3>
                  <div className="space-y-3">
                    {prescriptions.slice(0, 5).map((pres) => (
                      <div key={pres.prescription_id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-semibold">{pres.patient_name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(pres.date_issued).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                          {pres.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-4">Pending Verifications</h3>
                  <div className="space-y-3">
                    {pendingPrescriptions.slice(0, 5).map((pres) => (
                      <div key={pres.prescription_id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-semibold">{pres.patient_name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(pres.date_issued).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                          Pending
                        </span>
                      </div>
                    ))}
                    {pendingPrescriptions.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No pending verifications</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Prescriptions Tab */}
          {activeTab === "prescriptions" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Prescriptions</h2>
                <button
                  onClick={() => setShowCreatePrescription(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create Prescription
                </button>
              </div>

              {showCreatePrescription && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4">New Prescription</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Patient</label>
                      <select
                        value={prescriptionForm.patient_id}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, patient_id: e.target.value})}
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="">Choose a patient</option>
                        {patients.map(p => (
                          <option key={p.user_id} value={p.user_id}>
                            {p.name} - {p.email} {p.relationship && `(${p.relationship})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Diagnosis</label>
                      <textarea
                        value={prescriptionForm.diagnosis}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, diagnosis: e.target.value})}
                        placeholder="Enter diagnosis"
                        className="w-full p-3 border rounded-lg"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Notes</label>
                      <textarea
                        value={prescriptionForm.notes}
                        onChange={(e) => setPrescriptionForm({...prescriptionForm, notes: e.target.value})}
                        placeholder="Enter any additional notes"
                        className="w-full p-3 border rounded-lg"
                        rows="2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium">Medicines</label>
                        <button
                          onClick={addMedicineToPrescription}
                          className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Add Medicine
                        </button>
                      </div>

                      {prescriptionForm.medicines.map((med, index) => (
                        <div key={index} className="grid grid-cols-5 gap-3 mb-3 p-3 bg-gray-50 rounded">
                          <select
                            value={med.medicine_id}
                            onChange={(e) => updateMedicine(index, "medicine_id", e.target.value)}
                            className="p-2 border rounded"
                          >
                            <option value="">Select Medicine</option>
                            {medicines.map(m => (
                              <option key={m.medicine_id} value={m.medicine_id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Dosage"
                            value={med.dosage}
                            onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                            className="p-2 border rounded"
                          />
                          <input
                            type="text"
                            placeholder="Frequency"
                            value={med.frequency}
                            onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                            className="p-2 border rounded"
                          />
                          <input
                            type="text"
                            placeholder="Duration"
                            value={med.duration}
                            onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                            className="p-2 border rounded"
                          />
                          <button
                            onClick={() => removeMedicine(index)}
                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={createPrescription}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Create Prescription
                      </button>
                      <button
                        onClick={() => {
                          setShowCreatePrescription(false);
                          setPrescriptionForm({patient_id: "", diagnosis: "", notes: "", medicines: []});
                        }}
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {prescriptions.map((pres) => (
                  <div key={pres.prescription_id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Patient: {pres.patient_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Date: {new Date(pres.date_issued).toLocaleDateString()}
                        </p>
                        {pres.diagnosis && (
                          <p className="text-sm text-gray-700 mt-2">
                            <span className="font-semibold">Diagnosis:</span> {pres.diagnosis}
                          </p>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {pres.status}
                      </span>
                    </div>

                    {pres.medicines && pres.medicines.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3">Prescribed Medicines:</h4>
                        <div className="space-y-2">
                          {pres.medicines.map((med, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium">{med.medicine_name}</p>
                                <p className="text-sm text-gray-600">
                                  Dosage: {med.dosage} | Frequency: {med.frequency} | Duration: {med.duration}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pres.notes && (
                      <div className="mt-4 p-3 bg-blue-50 rounded">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Notes:</span> {pres.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Prescriptions Tab */}
          {activeTab === "pending" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Pending Prescription Verification ({pendingPrescriptions.length})
              </h2>

              {pendingPrescriptions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <CheckCircle size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No pending prescriptions to verify</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPrescriptions.map((pres) => (
                    <div key={pres.prescription_id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            Patient: {pres.patient_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Email: {pres.patient_email}
                          </p>
                          <p className="text-sm text-gray-600">
                            Phone: {pres.patient_phone}
                          </p>
                          <p className="text-sm text-gray-600">
                            Uploaded: {new Date(pres.date_issued).toLocaleDateString()}
                          </p>
                          {pres.assigned_doctor_specialty && (
                            <p className="text-sm text-blue-600">
                              Assigned Doctor Specialty: {pres.assigned_doctor_specialty}
                            </p>
                          )}
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                          {pres.status}
                        </span>
                      </div>

                      {pres.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Patient Notes:</span> {pres.notes}
                          </p>
                        </div>
                      )}

                      {pres.prescription_image && (
                        <div className="mb-4">
                          <img
                            src={pres.prescription_image}
                            alt="Prescription"
                            className="w-full max-h-96 object-contain border rounded"
                          />
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => verifyPrescription(pres.prescription_id, "Verified")}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle size={20} />
                          Verify
                        </button>
                        <button
                          onClick={() => verifyPrescription(pres.prescription_id, "Rejected")}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                        >
                          <XCircle size={20} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Patients Tab */}
          {activeTab === "patients" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Patients</h2>

              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search patients by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => (
                  <div key={patient.user_id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="text-blue-600" size={32} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{patient.name}</h3>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                        {patient.relationship && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            patient.relationship === 'Primary Doctor' 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {patient.relationship}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700 mb-4">
                      <p>
                        <span className="font-semibold">Phone:</span> {patient.phone}
                      </p>
                      <p>
                        <span className="font-semibold">Address:</span> {patient.address}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewPatientHistory(patient.user_id)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Eye size={20} />
                        View History
                      </button>
                      {patient.relationship !== 'Primary Doctor' && (
                        <button
                          onClick={() => assignPatient(patient.user_id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                          title="Assign as primary patient"
                        >
                          <UserCheck size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patient Detail Tab */}
          {activeTab === "patient-detail" && selectedPatient && (
            <div>
              <button
                onClick={() => setActiveTab("patients")}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                ← Back to Patients
              </button>

              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="text-blue-600" size={40} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                    <p className="text-gray-600">{selectedPatient.email}</p>
                    <p className="text-gray-600">{selectedPatient.phone}</p>
                    {selectedPatient.relationship && (
                      <p className="text-sm text-blue-600 mt-1">
                        Relationship: {selectedPatient.relationship}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4">Prescription History</h3>
              
              {patientHistory.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No prescription history</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patientHistory.map((pres) => (
                    <div key={pres.prescription_id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            Date: {new Date(pres.date_issued).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Doctor: {pres.doctor_name || "N/A"}
                          </p>
                          {pres.diagnosis && (
                            <p className="text-sm text-gray-700 mt-2">
                              <span className="font-semibold">Diagnosis:</span> {pres.diagnosis}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            pres.status === "Verified"
                              ? "bg-green-100 text-green-700"
                              : pres.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {pres.status}
                        </span>
                      </div>

                      {pres.medicines && pres.medicines.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold mb-3">Medicines:</h4>
                          <div className="space-y-2">
                            {pres.medicines.map((med, idx) => (
                              <div key={idx} className="p-3 bg-gray-50 rounded">
                                <p className="font-medium">{med.medicine_name}</p>
                                <p className="text-sm text-gray-600">
                                  {med.dosage} | {med.frequency} | {med.duration}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
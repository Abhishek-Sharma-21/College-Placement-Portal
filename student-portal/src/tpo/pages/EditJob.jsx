import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  updateJobStart,
  updateJobSuccess,
  updateJobFailure,
} from "@/store/slices/jobSlice";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    title: "",
    company: "",
    description: "",
    skills: "",
    ctc: "",
    location: "",
    deadline: "",
    applicationLink: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const loadJob = async () => {
      setError(null);
      try {
        const res = await axios.get(`http://localhost:4000/api/jobs/${id}`, {
          withCredentials: true,
        });
        const job = res.data;
        setForm({
          title: job.title || "",
          company: job.company || "",
          description: job.description || "",
          skills: Array.isArray(job.skills) ? job.skills.join(", ") : "",
          ctc: job.ctc ?? "",
          location: job.location || "",
          deadline: job.deadline ? job.deadline.substring(0, 10) : "",
          applicationLink: job.applicationLink || "",
        });
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };
    loadJob();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    dispatch(updateJobStart());
    try {
      const putData = {
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()),
      };
      const res = await axios.put(
        `http://localhost:4000/api/jobs/${id}`,
        putData,
        {
          withCredentials: true,
        }
      );
      dispatch(updateJobSuccess(res.data.job));
      setSuccess("Job updated successfully!");
      navigate("/tpo/jobs");
    } catch (e) {
      const msg = e.response?.data?.message || "Failed to update job.";
      dispatch(updateJobFailure(msg));
      setError(msg);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Edit Job</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Title *</label>
          <input
            type="text"
            name="title"
            required
            className="w-full border p-2 rounded"
            value={form.title}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-semibold">Company Name *</label>
          <input
            type="text"
            name="company"
            required
            className="w-full border p-2 rounded"
            value={form.company}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-semibold">Location *</label>
          <input
            type="text"
            name="location"
            required
            className="w-full border p-2 rounded"
            value={form.location}
            onChange={handleChange}
            placeholder="Bangalore / Remote"
          />
        </div>
        <div>
          <label className="block font-semibold">Description *</label>
          <textarea
            name="description"
            required
            className="w-full border p-2 rounded"
            value={form.description}
            onChange={handleChange}
            rows="4"
          />
        </div>
        <div>
          <label className="block font-semibold">
            Skills{" "}
            <span className="text-xs text-gray-500">(comma separated)</span> *
          </label>
          <input
            type="text"
            name="skills"
            required
            className="w-full border p-2 rounded"
            value={form.skills}
            onChange={handleChange}
            placeholder="JavaScript, React, Node.js"
          />
        </div>
        <div>
          <label className="block font-semibold">CTC (in LPA) *</label>
          <input
            type="number"
            name="ctc"
            required
            min="0"
            className="w-full border p-2 rounded"
            value={form.ctc}
            onChange={handleChange}
            placeholder="6"
          />
        </div>
        <div>
          <label className="block font-semibold">Deadline *</label>
          <input
            type="date"
            name="deadline"
            required
            className="w-full border p-2 rounded"
            value={form.deadline}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-semibold">
            Application Link (optional)
          </label>
          <input
            type="url"
            name="applicationLink"
            className="w-full border p-2 rounded"
            value={form.applicationLink}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold"
        >
          Save Changes
        </button>
        {success && <div className="text-green-600 p-2">{success}</div>}
      </form>
    </div>
  );
}

export default EditJob;

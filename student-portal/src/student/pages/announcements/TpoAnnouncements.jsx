import React, { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import axios from "axios";

const TpoAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("http://localhost:4000/api/announcements", {
          withCredentials: true,
        });
        setAnnouncements(res.data.announcements || []);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load announcements.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <FaBell className="text-xl text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">TPO Announcements</h3>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="space-y-6">
        {!loading && !error && announcements.length === 0 && (
          <div>No announcements yet.</div>
        )}
        {announcements.map((item) => (
          <div key={item._id} className="border-l-4 border-blue-600 pl-4">
            <h4 className="font-semibold text-gray-800">{item.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{item.content}</p>
            <p className="text-xs text-gray-400 mt-2">
              {item.scheduledAt
                ? `Scheduled: ${new Date(item.scheduledAt).toLocaleString()}`
                : `Posted: ${new Date(item.createdAt).toLocaleString()}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TpoAnnouncements;

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { Trash2 } from "lucide-react";

function TpoAnnouncementsManage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    try {
      const payload = { title, content };
      if (scheduledAt) payload.scheduledAt = scheduledAt;
      const res = await axios.post(
        "http://localhost:4000/api/announcements",
        payload,
        { withCredentials: true }
      );
      setSuccess("Announcement created.");
      setTitle("");
      setContent("");
      setScheduledAt("");
      setAnnouncements([res.data.announcement, ...announcements]);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create announcement.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await axios.delete(`http://localhost:4000/api/announcements/${id}`, {
        withCredentials: true,
      });
      setAnnouncements(announcements.filter((a) => a._id !== id));
    } catch (e) {
      setError(e.response?.data?.message || "Failed to delete announcement.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Announcement</CardTitle>
          <CardDescription>
            Share placement drives, events, and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-600 mb-3">{error}</div>}
          {success && <div className="text-green-600 mb-3">{success}</div>}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Content *</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Scheduled At (optional)
              </label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
            <Button type="submit">Publish</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
          <CardDescription>
            {loading ? "Loading..." : `${announcements.length} announcements`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!loading && announcements.length === 0 && (
            <div>No announcements yet.</div>
          )}
          {announcements.map((a) => (
            <div
              key={a._id}
              className="border rounded p-3 flex items-start justify-between"
            >
              <div>
                <h4 className="font-semibold">{a.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{a.content}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {a.scheduledAt
                    ? `Scheduled: ${new Date(a.scheduledAt).toLocaleString()}`
                    : `Posted: ${new Date(a.createdAt).toLocaleString()}`}
                </p>
              </div>
              <button
                className="text-red-600 hover:text-red-700"
                onClick={() => handleDelete(a._id)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default TpoAnnouncementsManage;

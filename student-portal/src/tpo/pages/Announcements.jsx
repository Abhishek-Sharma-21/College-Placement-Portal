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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { Trash2, FileText, Download, Loader2 } from "lucide-react";

function TpoAnnouncementsManage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");
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
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoadingAssessments(true);
    try {
      const res = await axios.get("http://localhost:4000/api/assessments/my", {
        withCredentials: true,
      });
      setAssessments(res.data || []);
    } catch (e) {
      console.error("Error fetching assessments:", e);
    } finally {
      setLoadingAssessments(false);
    }
  };

  const generatePDF = async () => {
    if (!selectedAssessment) {
      setError("Please select an assessment first");
      return;
    }

    setGeneratingPDF(true);
    setError(null);
    try {
      const res = await axios.get(
        `http://localhost:4000/api/assessments/${selectedAssessment}/pdf/passed-students`,
        { withCredentials: true }
      );
      setPdfUrl(res.data.pdfUrl);
      setPdfFileName(res.data.filename);
      setSuccess(
        `PDF generated successfully! ${res.data.passedStudentsCount} passed students included.`
      );
    } catch (e) {
      setError(
        e.response?.data?.message || "Failed to generate PDF. Make sure students have passed the assessment."
      );
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    try {
      const payload = { title, content };
      if (scheduledAt) payload.scheduledAt = scheduledAt;
      if (pdfUrl) {
        payload.pdfUrl = pdfUrl;
        payload.pdfFileName = pdfFileName;
      }
      const res = await axios.post(
        "http://localhost:4000/api/announcements",
        payload,
        { withCredentials: true }
      );
      setSuccess("Announcement created.");
      setTitle("");
      setContent("");
      setScheduledAt("");
      setSelectedAssessment("");
      setPdfUrl("");
      setPdfFileName("");
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

            {/* PDF Attachment Section */}
            <div className="border-t pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Attach Assessment Results PDF (optional)
                </label>
                <div className="space-y-3">
                  <Select
                    value={selectedAssessment || undefined}
                    onValueChange={setSelectedAssessment}
                    disabled={loadingAssessments || assessments.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                          loadingAssessments
                            ? "Loading assessments..."
                            : assessments.length === 0
                            ? "No assessments available"
                            : "Select an assessment"
                        } 
                      />
                    </SelectTrigger>
                    {assessments.length > 0 && (
                      <SelectContent>
                        {assessments.map((assessment) => (
                          <SelectItem key={assessment._id} value={assessment._id}>
                            {assessment.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    )}
                  </Select>
                  {selectedAssessment && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generatePDF}
                      disabled={generatingPDF}
                      className="w-full"
                    >
                      {generatingPDF ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate PDF of Passed Students
                        </>
                      )}
                    </Button>
                  )}
                  {pdfUrl && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            PDF Generated
                          </span>
                        </div>
                        <Badge variant="outline" className="bg-green-100">
                          {pdfFileName}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => {
                          window.open(pdfUrl, "_blank");
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Preview PDF
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Publish Announcement
            </Button>
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
              <div className="flex-1">
                <h4 className="font-semibold">{a.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{a.content}</p>
                {a.pdfUrl && (
                  <div className="mt-2">
                    <a
                      href={a.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <FileText className="h-4 w-4" />
                      {a.pdfFileName || "Download PDF"}
                    </a>
                  </div>
                )}
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

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { ROUTES } from "@/Routes/studentRout/routes";

const Assessments = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:4000/api/assessments/live",
        { withCredentials: true }
      );
      setAssessments(response.data);
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setError("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const isWithinTimeFrame = (assessment) => {
    const now = new Date();
    const startDate = assessment.startDate ? new Date(assessment.startDate) : null;
    const endDate = assessment.endDate ? new Date(assessment.endDate) : null;

    if (startDate && now < startDate) {
      return { valid: false, message: "Test will be available starting " + startDate.toLocaleString() };
    }
    if (endDate && now > endDate) {
      return { valid: false, message: "Test has ended on " + endDate.toLocaleString() };
    }
    return { valid: true };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">Loading assessments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Assessments</h2>

      {assessments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-600">
              No live assessments available
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Check back later for new assessments
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment) => {
            const timeCheck = isWithinTimeFrame(assessment);
            const now = new Date();
            const startDate = assessment.startDate ? new Date(assessment.startDate) : null;
            const endDate = assessment.endDate ? new Date(assessment.endDate) : null;

            return (
              <Card key={assessment._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {assessment.title}
                      </CardTitle>
                      <p className="text-gray-600 text-sm mb-3">
                        {assessment.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Duration: {assessment.duration} minutes</span>
                        </div>
                        {assessment.passingScore && (
                          <span>Passing Score: {assessment.passingScore}%</span>
                        )}
                        {assessment.difficulty && (
                          <Badge variant="outline" className="capitalize">
                            {assessment.difficulty}
                          </Badge>
                        )}
                        {assessment.category && (
                          <span>Category: {assessment.category}</span>
                        )}
                        <span>
                          Questions: {assessment.questions?.length || 0}
                        </span>
                      </div>
                      {startDate && endDate && (
                        <div className="mt-3 text-sm text-gray-600">
                          <p>
                            <strong>Available:</strong> {startDate.toLocaleString()} - {endDate.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!timeCheck.valid ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            {timeCheck.message}
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Test must be live in the time frame that TPO mentioned while creating assessment.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm font-medium">Available Now</span>
                      </div>
                      <Button
                        onClick={() => {
                          navigate(`${ROUTES.ASSESSMENTS}/${assessment._id}/take`);
                        }}
                      >
                        Start Assessment
                      </Button>
                    </div>
                  )}
                  {assessment.instructions && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold mb-1">Instructions:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {assessment.instructions}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Assessments;


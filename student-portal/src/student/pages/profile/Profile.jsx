import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import axios from "axios";

// --- Redux Imports ---
// Note: You will need to run 'npm install react-redux' for this to work
import { useDispatch, useSelector } from "react-redux";
// Assuming '@' is 'src/', this path should work if your slice is at 'src/store/slices/studentProfileSlice.js'
import {
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
} from "@/store/slices/studentProfileSlice";

// This component is dedicated to completing the Student Profile.
function ProfileCompletionForm() {
  // --- Local state for form inputs ---
  const [branch, setBranch] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // --- Redux State ---
  const dispatch = useDispatch();
  // Get state from Redux
  const { loading, error, profile } = useSelector(
    (state) => state.studentProfile
  );
  // Check if the profile has been successfully updated
  const success = !!profile && !loading && !error;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      // Create a temporary URL for client-side preview
      setImagePreview(URL.createObjectURL(file));
    } else {
      setProfileImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(updateProfileStart()); // Dispatch start action

    // 1. Create FormData
    const formData = new FormData();
    formData.append("branch", branch);
    formData.append("cgpa", cgpa);
    formData.append("gradYear", gradYear);
    formData.append("resumeLink", resumeLink);
    formData.append("linkedIn", linkedIn);
    formData.append("bio", bio);
    if (profileImageFile) {
      formData.append("profilePic", profileImageFile);
    }

    try {
      // 4. Send the request
      const response = await axios.put(
        "/api/profile/profile", // The full, correct API path
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      // Dispatch success action with the updated profile
      dispatch(updateProfileSuccess(response.data.profile));
      console.log("Profile updated:", response.data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to update profile. Please try again.";

      // Dispatch failure action with the error message
      dispatch(updateProfileFailure(message));
      console.error("Profile update failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center ">
      <Card className="w-full max-w-3xl shadow-xl border-t-4 border-blue-500">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">
            Complete Your Student Profile
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            Just few more details to get you started!
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* --- Image Upload Section --- */}
            <div className="flex flex-col items-center justify-center md:col-span-4">
              <Label
                htmlFor="profile-pic"
                className="mb-4 flex h-48 w-48 cursor-pointer items-center justify-center rounded-full border-4 border-dashed border-gray-300 bg-gray-100 p-4 text-center text-gray-500 transition hover:border-blue-400 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-500 dark:hover:bg-gray-600"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>Click to add Profile Picture</span>
                )}
              </Label>
              <Input
                id="profile-pic"
                type="file"
                accept="image/png, image/jpeg"
                className="hidden" // Hide the default ugly input
                onChange={handleImageChange}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG or JPG (max. 2MB)
              </p>
            </div>

            {/* --- Form Fields Section --- */}
            <div className="grid gap-6 md:col-span-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="student-branch">Branch</Label>
                  <Select onValueChange={setBranch} value={branch}>
                    <SelectTrigger id="student-branch">
                      <SelectValue placeholder="Select your branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">
                        Computer Science
                      </SelectItem>
                      <SelectItem value="Electronics & Communication">
                        Electronics & Communication
                      </SelectItem>
                      <SelectItem value="Mechanical Engineering">
                        Mechanical Engineering
                      </SelectItem>
                      <SelectItem value="Civil Engineering">
                        Civil Engineering
                      </SelectItem>
                      <SelectItem value="Information Technology">
                        Information Technology
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="student-grad-year">Graduation Year</Label>
                  <Input
                    id="student-grad-year"
                    type="number"
                    placeholder="e.g., 2025"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="student-cgpa">CGPA</Label>
                  <Input
                    id="student-cgpa"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 8.5"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    On a 10-point scale.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="student-resume-link">
                    Resume Link{" "}
                    <span className="text-gray-500">(Optional)</span>
                  </Label>
                  <Input
                    id="student-resume-link"
                    type="url"
                    placeholder="e.g., drive.google.com/my-resume"
                    value={resumeLink}
                    onChange={(e) => setResumeLink(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="student-linkedin">
                  LinkedIn Profile{" "}
                  <span className="text-gray-500">(Optional)</span>
                </Label>
                <Input
                  id="student-linkedin"
                  type="url"
                  placeholder="e.g., linkedin.com/in/yourprofile"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="student-bio">
                  Bio / About Me{" "}
                  <span className="text-gray-500">(Optional)</span>
                </Label>
                <Textarea
                  id="student-bio"
                  placeholder="Tell us a little about yourself..."
                  className="min-h-[100px]"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col">
            {/* --- Error/Success Messages From Redux Store --- */}
            {error && (
              <div className="mb-4 w-full rounded-md bg-red-100 p-3 text-center text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 w-full rounded-md bg-green-100 p-3 text-center text-sm text-green-700 dark:bg-green-900 dark:text-green-200">
                Profile updated successfully!
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default ProfileCompletionForm;

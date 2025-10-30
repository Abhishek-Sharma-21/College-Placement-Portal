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
import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
} from "@/store/slices/studentProfileSlice";
import { ROUTES } from "@/Routes/studentRout/routes";

const API_URL = "http://localhost:4000/api/profile";

function ProfileCompletionForm() {
  const dispatch = useDispatch();
  const { loading, error, profile } = useSelector(
    (state) => state.studentProfile
  );
  const { user } = useSelector((state) => state.auth);
  console.log(user);

  // Local state for form inputs
  const [branch, setBranch] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);

  // Fetch profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      dispatch(fetchProfileStart());
      try {
        const response = await axios.get(`${API_URL}/profile`, {
          withCredentials: true,
        });
        dispatch(fetchProfileSuccess(response.data.profile));

        // Pre-fill form with existing data
        const profileData = response.data.profile;
        if (profileData) {
          setBranch(profileData.branch || "");
          setCgpa(profileData.cgpa?.toString() || "");
          setGradYear(profileData.gradYear?.toString() || "");
          setResumeLink(profileData.resumeLink || "");
          setLinkedIn(profileData.linkedIn || "");
          setBio(profileData.bio || "");
          setImagePreview(profileData.profilePicUrl || null);
        }
      } catch (err) {
        // Profile might not exist yet - that's okay for first-time setup
        if (err.response?.status === 404) {
          setIsFirstTimeSetup(true);
          dispatch(fetchProfileSuccess(null));
        } else {
          const message =
            err.response?.data?.message || "Failed to fetch profile";
          dispatch(fetchProfileFailure(message));
        }
      }
    };

    fetchProfile();
  }, [dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }

      // Validate file type
      if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
        alert("Only PNG and JPG images are allowed");
        return;
      }

      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setProfileImageFile(null);
      // Keep existing image preview if no new file
      if (profile?.profilePicUrl) {
        setImagePreview(profile.profilePicUrl);
      } else {
        setImagePreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(updateProfileStart());

    // Validate required fields
    if (!branch) {
      dispatch(updateProfileFailure("Branch is required"));
      return;
    }

    const formData = new FormData();
    formData.append("branch", branch);
    if (cgpa) formData.append("cgpa", cgpa);
    if (gradYear) formData.append("gradYear", gradYear);
    if (resumeLink) formData.append("resumeLink", resumeLink);
    if (linkedIn) formData.append("linkedIn", linkedIn);
    if (bio) formData.append("bio", bio);

    // Only append new image if user selected one
    if (profileImageFile) {
      formData.append("profilePic", profileImageFile);
    }

    try {
      const response = await axios.put(`${API_URL}/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      dispatch(updateProfileSuccess(response.data.profile));

      // Update preview with new Cloudinary URL
      if (response.data.profile.profilePicUrl) {
        setImagePreview(response.data.profile.profilePicUrl);
      }

      // Clear the file input
      setProfileImageFile(null);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to update profile. Please try again.";
      dispatch(updateProfileFailure(message));
      console.error("Profile update failed:", err);
    }
  };

  const success = profile && !loading && !error;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-3xl shadow-xl border-t-4 border-blue-500">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">
            {profile ? "Update" : "Complete"} Your Student Profile
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            {profile
              ? "Update your profile information"
              : "Just a few more details to get you started!"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Image Upload Section */}
            <div className="flex flex-col items-center justify-center md:col-span-4">
              <Label
                htmlFor="profile-pic"
                className="mb-4 flex h-48 w-48 cursor-pointer items-center justify-center rounded-full border-4 border-dashed border-gray-300 bg-gray-100 p-4 text-center text-gray-500 transition hover:border-blue-400 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-500 dark:hover:bg-gray-600 overflow-hidden"
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
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                onChange={handleImageChange}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG or JPG (max. 2MB)
              </p>
            </div>

            {/* Form Fields Section */}
            <div className="grid gap-6 md:col-span-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="student-branch">
                    Branch <span className="text-red-500">*</span>
                  </Label>
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
                    min="2020"
                    max="2030"
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
                    min="0"
                    max="10"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    On a 10-point scale
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
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {bio.length}/500 characters
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col">
            {error && (
              <div className="mb-4 w-full rounded-md bg-red-100 p-3 text-center text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 w-full rounded-md bg-green-100 p-3 text-center text-sm text-green-700 dark:bg-green-900 dark:text-green-200">
                Profile {profile ? "updated" : "created"} successfully!
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Saving..."
                : profile
                ? "Update Profile"
                : "Save Profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default ProfileCompletionForm;

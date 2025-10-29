import React from "react";
import { FaBell } from "react-icons/fa";

const announcements = [
  {
    title: "Placement Drive - Week 1",
    content:
      "Major tech companies visiting campus next week. Ensure all assessments are completed.",
    time: "2 days ago",
  },
  {
    title: "Resume Workshop",
    content: "Join us for a professional resume building workshop this Friday at 3 PM.",
    time: "4 days ago",
  },
  {
    title: "New Company Registration",
    content:
      "Microsoft has joined our placement portal. New positions available in Software Engineering.",
    time: "1 week ago",
  },
];

const TpoAnnouncements = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <FaBell className="text-xl text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">TPO Announcements</h3>
      </div>

      <div className="space-y-6">
        {announcements.map((item) => (
          <div key={item.title} className="border-l-4 border-blue-600 pl-4">
            <h4 className="font-semibold text-gray-800">{item.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{item.content}</p>
            <p className="text-xs text-gray-400 mt-2">{item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TpoAnnouncements;



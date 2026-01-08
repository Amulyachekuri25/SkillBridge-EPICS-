// // src/components/UploadModal.jsx
// import { useState } from "react";
// import { uploadScreenshot } from "../api/api";

// export default function UploadModal({ internship, userId, onClose }) {
//   const [file, setFile] = useState(null);
//   const [msg, setMsg] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleUpload = async () => {
//     if (!file) {
//       console.log("FILE:", file);
// console.log("USER ID:", userId);
// console.log("INTERNSHIP ID:", internship.id);
// console.log("STUDENT EMAIL:", localStorage.getItem("email"));
// console.log("INTERNSHIP TITLE:", internship.title);

//       setMsg("⚠️ Please select a file first!");
//       return;
//     }
//     setLoading(true);
//     setMsg("");

//     const form = new FormData();
//     // key names must match backend expectations
//     form.append("file", file);
//     form.append("userId", String(userId));
//     form.append("internshipId", String(internship.id));
//     form.append("studentEmail", localStorage.getItem("email") || "");
//     form.append("originalTitle", internship.title || "");

//     try {
//       const res = await uploadScreenshot(form);
//       // server should send message / structured data
//       const data = res.data;
//       setMsg(data?.message || (data?.status === "success" ? "✅ Uploaded & processed" : "✅ Uploaded successfully!"));
//     } catch (err) {
//       console.error("Upload error (frontend):", err?.response || err);
//       // show server error if present for debugging
//       const serverMsg = err?.response?.data?.error || err?.response?.data?.message;
//       setMsg(serverMsg ? `⚠️ ${serverMsg}` : "⚠️ Upload failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="modal">
//       <h2>Upload Application Screenshot</h2>

//       <input
//         type="file"
//         accept="image/*"
//         onChange={(e) => setFile(e.target.files[0])}
//       />

//       <div style={{ marginTop: 12 }}>
//         <button onClick={handleUpload} disabled={loading}>
//           {loading ? "Uploading..." : "Upload"}
//         </button>
//         <button onClick={onClose} disabled={loading} style={{ marginLeft: 8 }}>
//           Close
//         </button>
//       </div>

//       {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
//     </div>
//   );
// }




import { useState, useEffect } from "react";
import { uploadScreenshot } from "../api/api";

export default function UploadModal({ internship, onClose }) {
  const [file, setFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch userId from email
  useEffect(() => {
    const email = localStorage.getItem("email");

    async function fetchUserId() {
      try {
        const res = await fetch(`http://localhost:5000/api/user/by-email/${email}`);
        const data = await res.json();

        if (data?.user?.id) {
          setUserId(data.user.id);
        } else {
          setMsg("⚠️ Could not fetch user ID.");
        }
      } catch (err) {
        console.error("Error fetching user ID:", err);
        setMsg("⚠️ Server error fetching user ID.");
      }
    }

    fetchUserId();
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setMsg("⚠️ Please select a file first!");
      return;
    }
    if (!userId) {
      setMsg("⚠️ User ID missing!");
      return;
    }

    setLoading(true);
    setMsg("");

    const form = new FormData();
    form.append("file", file);
    form.append("userId", String(userId));
    form.append("internshipId", String(internship.id));
    form.append("studentEmail", localStorage.getItem("email"));
    form.append("originalTitle", internship.title);

    try {
      const res = await uploadScreenshot(form);
      setMsg(res.data.message || "✅ Uploaded successfully!");
    } catch (err) {
      console.error(err);
      setMsg("⚠️ Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <h2>Upload Application Screenshot</h2>

      {!userId && <p>Loading user details...</p>}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <div style={{ marginTop: 12 }}>
        <button onClick={handleUpload} disabled={loading || !userId}>
          {loading ? "Uploading..." : "Upload"}
        </button>
        <button onClick={onClose} disabled={loading} style={{ marginLeft: 8 }}>
          Close
        </button>
      </div>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}

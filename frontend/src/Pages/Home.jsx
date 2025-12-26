import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { LogOut, Upload, FileAudio, CheckCircle, AlertCircle, Loader2, Music, History, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "../Styles/Home.css";

function Home() {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // Fetch profile + transcript history
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    const fetchTranscripts = async () => {
      try {
        const res = await api.get("/transcripts");
        setTranscripts(res.data);
      } catch (err) {
        console.error("Failed to fetch transcripts:", err);
      }
    };

    fetchProfile();
    fetchTranscripts();
    fetchProfile();
    fetchTranscripts();
  }, []);

  const deleteTranscript = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transcript?")) return;

    try {
      await api.delete(`/transcripts/${id}`);
      setTranscripts((prev) => prev.filter((t) => (t.id || t.fileName) !== id)); // Handle both id scenarios if needed, mainly id
    } catch (err) {
      console.error("Failed to delete transcript:", err);
      alert("Failed to delete transcript");
    }
  };

  // Poll job status
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/job/${jobId}`);
        console.log("Job status:", res.data);

        if (res.data.status === "completed") {
          clearInterval(interval);
          setJobId(null);
          setIsUploading(false);

          // Set current transcript to show in UI
          setCurrentTranscript({
            id: res.data.id || jobId,
            fileName: res.data.fileName || res.data.filename,
            text: res.data.transcript
          });

          const updatedTranscripts = await api.get("/transcripts");
          setTranscripts(updatedTranscripts.data);
          // Removed alert for better UX
        }

        if (res.data.status === "failed") {
          clearInterval(interval);
          setJobId(null);
          setIsUploading(false);
          alert("Transcription failed!");
        }
      } catch (err) {
        console.error("Error checking job:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const upload = async () => {
    if (!file) {
      alert("Please select an audio file first!");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);
    setIsUploading(true);

    try {
      const res = await api.post("/upload", formData);
      setJobId(res.data.jobId);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout", {}, { headers: { Authorization: `Bearer ${profile?.accessToken}` } });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/Login");
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
      // Force logout on error
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/Login");
    }
  };

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            <div className="logo-area">
              <div className="logo-icon-bg">
                <Music size={20} />
              </div>
              <h1 className="logo-text">
                AudioTranscriber
              </h1>
            </div>
            <div className="nav-actions">
              {profile && (
                <span className="user-greeting">
                  Hello, {profile.username}
                </span>
              )}
              <button
                onClick={logout}
                className="btn-logout"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {/* Upload Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="upload-card"
        >
          <div className="upload-header">
            <h2 className="upload-title">Upload New Audio</h2>
            <p className="upload-subtitle">MP3, WAV, or M4A supported</p>
          </div>

          <div className="drop-zone">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              id="file-upload"
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="upload-label"
            >
              <div className="upload-icon-circle">
                <Upload size={32} />
              </div>
              <div className="upload-text">
                <p style={{ fontWeight: 500, color: '#444' }}>Click to upload or drag and drop</p>
                <p style={{ fontSize: '0.875rem', color: '#888' }}>Maximum file size 50MB</p>
              </div>
            </label>
            {file && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="file-display"
              >
                <FileAudio size={16} />
                {file.name}
              </motion.div>
            )}
          </div>

          <div className="upload-actions">
            <button
              onClick={upload}
              disabled={!file || isUploading}
              className="btn-primary"
            >
              {isUploading ? (
                <>
                  <Loader2 size={20} className="spin-icon" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Start Transcription
                </>
              )}
            </button>
          </div>
        </motion.section>

        {/* Current Transcript Section */}
        <AnimatePresence>
          {currentTranscript && (
            <motion.section
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="upload-card"
              style={{ borderColor: '#22c55e', backgroundColor: '#f0fdf4' }}
            >
              <div className="upload-header" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#15803d' }}>
                  <CheckCircle size={24} />
                  <h2 className="upload-title" style={{ color: '#15803d' }}>Transcription Complete</h2>
                </div>
                <p className="upload-subtitle" style={{ color: '#166534' }}>{currentTranscript.fileName}</p>
              </div>

              <div className="transcript-box" style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #bbf7d0',
                maxHeight: '300px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                <p style={{ color: '#374151', lineHeight: '1.6' }}>{currentTranscript.text}</p>
              </div>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  onClick={() => setCurrentTranscript(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#166534',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Close
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Transcript History */}
        <section>
          <div className="history-section-header">
            <History size={24} color="#a8a29e" />
            <h2 className="history-title">Transcript History</h2>
          </div>

          <div className="transcript-grid">
            <AnimatePresence>
              {transcripts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="empty-state"
                >
                  <p>No transcripts yet. Upload an audio file to get started!</p>
                </motion.div>
              ) : (
                transcripts.map((t, index) => (
                  <motion.div
                    key={t.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="transcript-card"
                  >
                    <div className="transcript-content">
                      <div className="transcript-details">
                        <div className="check-icon-bg">
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <h3 className="transcript-filename">
                            {t.fileName || t.filename || "Untitled"}
                          </h3>
                          <p className="transcript-text">
                            {t.text || t.transcript || "No text available"}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <span className="transcript-date">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "Just now"}
                        </span>
                        <button
                          onClick={() => deleteTranscript(t.id || t.id)}
                          className="btn-icon-danger"
                          title="Delete Transcript"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div >
  );
}

export default Home;

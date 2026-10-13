import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PollCard from "../components/PollCard";
import { API_BASE_URL } from "../config.js";
import { apiFetch } from "../lib/api.js";
import { useAuth } from "../context/AuthContext";

export default function PollDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [poll, setPoll] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { apiFetch(`${API_BASE_URL}/polls/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message || "Poll not found."); setPoll(data); }).catch((err) => setError(err.message)); }, [id, token]);
  if (error) return <p className="text-red-400 text-sm">{error}</p>;
  if (!poll) return <p className="text-[var(--color-text-muted)] text-sm">Loading poll...</p>;
  return <PollCard poll={poll} />;
}

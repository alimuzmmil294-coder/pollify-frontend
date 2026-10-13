import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import PollCard from "../components/PollCard";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config.js";

export default function Saved() {
  const { token } = useAuth();
  const [polls, setPolls] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`${API_BASE_URL}/polls/bookmarks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to load saved polls.");
        setPolls(Array.isArray(data) ? data : data.polls || []);
      })
      .catch((err) => setError(err.message));
  }, [token]);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Saved</h1>
      <p className="text-[var(--color-text-muted)] mb-6">
        Polls you've bookmarked for later.
      </p>
      {error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : polls.length ? (
        <div className="flex flex-col gap-4">
          {polls.map((poll) => (
            <PollCard key={poll._id} poll={poll} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="bookmark"
          title="Nothing saved yet"
          subtitle="Tap the bookmark icon on any poll to save it here."
          ctaLabel="Explore polls"
          ctaTo="/"
        />
      )}
    </div>
  );
}

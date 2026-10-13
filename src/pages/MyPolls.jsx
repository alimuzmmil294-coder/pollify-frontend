import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";
import PollCard from "../components/PollCard";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config.js";

export default function MyPolls() {
  const { token } = useAuth();
  const [polls, setPolls] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/polls/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to load your polls.");
        setPolls(Array.isArray(data) ? data : data.polls || []);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">My Polls</h1>
      <p className="text-[var(--color-text-muted)] mb-6">
        Polls you've created.
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
          icon="edit"
          title="No polls yet"
          subtitle="Create your first poll and see how the community responds."
          ctaLabel="Create a poll"
          ctaTo="/create"
        />
      )}
    </div>
  );
}

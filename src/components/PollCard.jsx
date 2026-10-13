import { useEffect, useMemo, useState } from "react";
import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";
import { usePolls } from "../context/PollContext";
import { API_BASE_URL } from "../config.js";

const OPEN_ANSWER_MAX_LENGTH = 500;

function ResultSummary({ results, selectedValue }) {
  return <div className="flex flex-col gap-2 mb-4">{results.map((result, index) => <div key={result._id || result.star || `${result.text}-${index}`} className="relative overflow-hidden rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm"><div className="absolute inset-y-0 left-0 bg-[var(--color-brand)]/10" style={{ width: `${result.percent || 0}%` }} /><div className="relative flex justify-between gap-3"><span className={String(selectedValue) === String(result._id ?? result.star) ? "font-semibold text-[var(--color-brand)]" : ""}>{result.text || result.label}</span><span className="text-[var(--color-text-muted)]">{result.count ?? 0} · {result.percent ?? 0}%</span></div></div>)}</div>;
}

export default function PollCard({ poll }) {
  const { token, user } = useAuth();
  const { deletePoll } = usePolls();
  const [current, setCurrent] = useState(poll);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState(poll.myVote || "");
  const [saved, setSaved] = useState(Boolean(poll.isBookmarked));
  const [editing, setEditing] = useState(false);
  const [editQuestion, setEditQuestion] = useState(poll.question || "");
  const [editCategory, setEditCategory] = useState(poll.category || "");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");

  useEffect(() => { setCurrent(poll); setAnswer(poll.myVote || ""); setSaved(Boolean(poll.isBookmarked)); setEditQuestion(poll.question || ""); setEditCategory(poll.category || ""); }, [poll]);
  const id = current._id || current.id;
  const selected = current.myVote ?? null;
  const active = !current.closed;
  const author = current.creator?.fullName || current.creator?.name || "Unknown";
  const isOwner = user && String(current.creator?._id || current.authorId) === String(user._id || user.id);
  const headers = { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
  const results = useMemo(() => current.results || [], [current.results]);
  const optionResults = results.length ? results : (current.options || []).map((option) => ({ ...option, count: 0, percent: 0 }));

  async function refresh() {
    const response = await fetch(`${API_BASE_URL}/polls/${id}?noview=true`, { headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not refresh poll results.");
    setCurrent(data); setAnswer(data.myVote || "");
  }
  async function vote(value) {
    if (!active || pending) return;
    setPending(true); setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${id}/vote`, { method: "POST", headers, body: JSON.stringify({ value }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Vote was rejected.");
      await refresh();
    } catch (err) { setError(err.message || "Could not save your vote."); } finally { setPending(false); }
  }
  async function removeVote() {
    if (!active || selected === null || pending) return;
    setPending(true); setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${id}/vote`, { method: "DELETE", headers });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not remove your vote.");
      await refresh();
    } catch (err) { setError(err.message || "Could not remove your vote."); } finally { setPending(false); }
  }
  async function toggleBookmark() {
    if (pending) return;
    setPending(true); setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${id}/bookmarks`, { method: "POST", headers });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not update saved polls.");
      setSaved(data.bookmarked);
    } catch (err) { setError(err.message || "Could not update saved polls."); } finally { setPending(false); }
  }
  async function removePoll() {
    if (!window.confirm("Delete this poll?")) return;
    setPending(true); setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${id}`, { method: "DELETE", headers });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete the poll.");
      deletePoll(id);
    } catch (err) { setError(err.message || "Could not delete the poll."); } finally { setPending(false); }
  }
  async function saveEdit(event) {
    event.preventDefault();
    if (pending || !editQuestion.trim()) return;
    setPending(true); setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/polls/${id}`, { method: "PATCH", headers, body: JSON.stringify({ question: editQuestion.trim(), category: editCategory }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not update the poll.");
      await refresh(); setEditing(false);
    } catch (err) { setError(err.message || "Could not update the poll."); } finally { setPending(false); }
  }
  async function loadComments() {
    setCommentError("");
    try { const response = await fetch(`${API_BASE_URL}/comment/${id}`, { headers }); const data = await response.json(); if (!response.ok) throw new Error(data.message || "Could not load comments."); setComments(data); } catch (err) { setCommentError(err.message); }
  }
  async function addComment(event) {
    event.preventDefault(); if (!commentText.trim() || pending) return;
    setPending(true); setCommentError("");
    try { const response = await fetch(`${API_BASE_URL}/comment/${id}`, { method: "POST", headers, body: JSON.stringify({ text: commentText.trim() }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message || "Could not add comment."); setComments((items) => [data, ...items]); setCommentText(""); } catch (err) { setCommentError(err.message); } finally { setPending(false); }
  }
  async function deleteComment(commentId) {
    if (pending) return; setPending(true); setCommentError("");
    try { const response = await fetch(`${API_BASE_URL}/comment/${commentId}`, { method: "DELETE", headers }); const data = await response.json(); if (!response.ok) throw new Error(data.message || "Could not delete comment."); setComments((items) => items.filter((comment) => comment._id !== commentId)); } catch (err) { setCommentError(err.message); } finally { setPending(false); }
  }
  async function sharePoll() {
    const url = `${window.location.origin}/poll/${id}`;
    try { if (navigator.share) await navigator.share({ title: current.question, text: current.question, url }); else { await navigator.clipboard.writeText(url); setError("Poll link copied to clipboard."); } } catch (err) { if (err.name !== "AbortError") setError("Could not share this poll."); }
  }

  return <article className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm hover:border-[var(--color-border-light)] transition-colors sm:p-6">
    <div className="flex items-center justify-between mb-3"><p className="text-sm"><span className="font-semibold">{author}</span>{current.creator?.username && <span className="text-[var(--color-text-faint)]"> · @{current.creator.username}</span>}</p>{isOwner && <span className="flex gap-3">{active && <button type="button" disabled={pending} onClick={() => setEditing(true)} className="text-xs text-[var(--color-brand)] disabled:opacity-50">Edit</button>}<button type="button" disabled={pending} onClick={removePoll} className="text-xs text-red-400 disabled:opacity-50">Delete</button></span>}</div>
    {editing && <form onSubmit={saveEdit} className="mb-4 rounded-xl border border-[var(--color-border)] p-3 flex flex-col gap-3"><p className="text-xs text-[var(--color-text-muted)]">Edit metadata only. Poll type, options, images, and votes are preserved.</p><input required value={editQuestion} onChange={(event) => setEditQuestion(event.target.value)} className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" aria-label="Poll question" /><input value={editCategory} onChange={(event) => setEditCategory(event.target.value)} placeholder="Category" className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" /><div className="flex gap-2"><button disabled={pending} className="bg-[var(--color-brand)] text-black text-sm font-semibold px-3 py-2 rounded-lg disabled:opacity-50">{pending ? "Saving..." : "Save changes"}</button><button type="button" disabled={pending} onClick={() => setEditing(false)} className="text-sm px-3 py-2">Cancel</button></div></form>}
    <h3 className="font-semibold text-lg mb-4">{current.question}</h3>
    {current.closed && <p className="mb-3 text-xs font-medium text-[var(--color-text-muted)]">This poll is closed. Votes are final.</p>}
    {error && <p role="alert" className="mb-3 text-sm text-red-400">{error}</p>}
    {current.type === "open" ? <OpenPoll answer={answer} setAnswer={setAnswer} selected={selected} active={active} pending={pending} vote={() => vote(answer.trim())} results={results} /> : current.type === "rating" ? <RatingPoll selected={selected} active={active} pending={pending} vote={vote} results={results} /> : current.type === "image" ? <ImagePoll results={optionResults} selected={selected} active={active} pending={pending} vote={vote} /> : <OptionPoll results={optionResults} selected={selected} active={active} pending={pending} vote={vote} type={current.type} />}
    {selected !== null && active && <button type="button" onClick={removeVote} disabled={pending} className="mb-4 text-sm text-red-400 disabled:opacity-50">{pending ? "Updating vote..." : "Remove vote"}</button>}
    {(selected !== null || current.closed) && !["open", "rating"].includes(current.type) && <ResultSummary results={optionResults} selectedValue={selected} />}
    <div className="flex items-center gap-5 pt-1 text-[var(--color-text-muted)]"><button type="button" onClick={() => { setCommentsOpen((open) => !open); if (!commentsOpen) loadComments(); }} className="flex items-center gap-1.5 text-sm"><Icon name="message" size={15} />{comments.length || current.commentsCount || 0}</button><button type="button" disabled={pending} onClick={toggleBookmark} className={`flex items-center gap-1.5 text-sm disabled:opacity-50 ${saved ? "text-[var(--color-brand)]" : ""}`}><Icon name="bookmark" size={15} />{saved ? "Saved" : "Save"}</button><button type="button" onClick={sharePoll} className="ml-auto"><Icon name="share" size={15} /></button></div>
    {commentsOpen && <section className="mt-4 border-t border-[var(--color-border)] pt-4"><form onSubmit={addComment} className="flex gap-2"><input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Write a comment" className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" /><button disabled={pending || !commentText.trim()} className="text-sm font-semibold text-[var(--color-brand)] disabled:opacity-50">Post</button></form>{commentError && <p role="alert" className="mt-2 text-sm text-red-400">{commentError}</p>}<div className="mt-3 flex flex-col gap-3">{comments.length === 0 ? <p className="text-sm text-[var(--color-text-faint)]">No comments yet.</p> : comments.map((comment) => <div key={comment._id} className="text-sm"><div className="flex justify-between gap-3"><p><span className="font-semibold">{comment.user?.fullName || "User"}</span>{comment.user?.username && <span className="text-[var(--color-text-faint)]"> · @{comment.user.username}</span>}</p>{String(comment.user?._id) === String(user?._id || user?.id) && <button type="button" onClick={() => deleteComment(comment._id)} disabled={pending} className="text-xs text-red-400">Delete</button>}</div><p className="mt-1 break-words text-[var(--color-text-muted)]">{comment.text}</p></div>)}</div></section>}
  </article>;
}

function OptionPoll({ results, selected, active, pending, vote, type }) {
  return <div className="flex flex-col gap-2 mb-4">{results.map((option, index) => { const id = option._id || option.id; const chosen = String(selected) === String(id); return <button type="button" key={id || index} disabled={!active || pending} onClick={() => vote(id)} className={`rounded-xl border px-4 py-2.5 text-left text-sm disabled:opacity-70 ${chosen ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10" : "border-[var(--color-border)] hover:border-[var(--color-brand)]/50"}`}><span className="flex items-center gap-2">{type === "yesno" ? <Icon name={option.text === "Yes" ? "check" : "logout"} size={14} /> : <span className="w-5 h-5 rounded-full bg-[var(--color-border-light)] flex items-center justify-center text-[10px]">{String.fromCharCode(65 + index)}</span>}{option.text}</span></button>; })}</div>;
}

function ImagePoll({ results, selected, active, pending, vote }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">{results.map((option, index) => { const id = option._id || option.id; const chosen = String(selected) === String(id); return <button type="button" key={id || index} disabled={!active || pending} onClick={() => vote(id)} aria-pressed={chosen} className={`overflow-hidden rounded-xl border text-left disabled:opacity-70 ${chosen ? "border-[var(--color-brand)] ring-1 ring-[var(--color-brand)]" : "border-[var(--color-border)] hover:border-[var(--color-brand)]/50"}`}><img src={option.image} alt={option.text?.trim() || `Poll option ${index + 1}`} className="h-40 w-full object-cover" /><span className="block px-3 py-2 text-sm">{option.text || `Option ${index + 1}`}{selected !== null && <span className="float-right text-[var(--color-text-muted)]">{option.count ?? 0} · {option.percent ?? 0}%</span>}</span></button>; })}</div>;
}

function RatingPoll({ selected, active, pending, vote, results }) {
  return <><div className="flex items-center gap-1.5 mb-4">{[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} disabled={!active || pending} onClick={() => vote(star)} aria-label={`Rate ${star}`} className="focus-ring rounded disabled:opacity-70"><Icon name="star" size={26} className={Number(selected) >= star ? "fill-[var(--color-warning)] text-[var(--color-warning)]" : "text-[var(--color-border-light)]"} /></button>)}</div>{(selected !== null || !active) && <ResultSummary results={results} selectedValue={selected} />}</>;
}

function OpenPoll({ answer, setAnswer, selected, active, pending, vote, results }) {
  return <div className="mb-4">{active && <><textarea value={answer} maxLength={OPEN_ANSWER_MAX_LENGTH} onChange={(event) => setAnswer(event.target.value)} disabled={pending} placeholder="Share your answer" className="w-full min-h-24 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]/60 disabled:opacity-60" /><div className="mt-1 flex justify-between text-xs text-[var(--color-text-faint)]"><span>{selected !== null ? "Update your answer while active." : "Answers are visible after submission."}</span><span>{answer.length}/{OPEN_ANSWER_MAX_LENGTH}</span></div><button type="button" onClick={vote} disabled={pending || !answer.trim()} className="mt-3 bg-[var(--color-brand)] text-black text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50">{pending ? "Saving..." : selected !== null ? "Update answer" : "Submit answer"}</button></>}{(selected !== null || !active) && <div className="mt-4"><p className="text-xs font-semibold tracking-widest text-[var(--color-text-faint)] mb-2">RESPONSES ({results.length})</p><div className="flex flex-col gap-2">{results.map((result, index) => <p key={`${result.text}-${index}`} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm break-words">{result.text}</p>)}</div></div>}</div>;
}

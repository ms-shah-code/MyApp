// src/components/CommentBox.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { FaUserCircle, FaThumbsUp, FaRegThumbsUp } from "react-icons/fa";
import { handleError, handleSuccess } from "../utility";
import { ToastContainer } from "react-toastify";
import "../styles/comment.css";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8000/api/v1/comments";

const CommentBox = ({ videoId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  // replies: { commentId: [replyObj,...] }
  const [replies, setReplies] = useState({});
  // openReplies: { commentId: boolean }
  const [openReplies, setOpenReplies] = useState({});
  const [replyBox, setReplyBox] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});

  // helper: time ago
  const timeAgo = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const posted = new Date(timestamp);
    const seconds = Math.floor((now - posted) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Fetch comments on mount / videoId change
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/${videoId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          const fetched = data.data || [];

          // Build initial replies map from comment.replies if backend populated them
          const initialReplies = {};
          fetched.forEach((c) => {
            if (Array.isArray(c.replies) && c.replies.length > 0) {
              // store replies array (already populated with owner)
              initialReplies[c._id] = c.replies;
            }
          });

          setComments(fetched);
          setReplies(initialReplies);
        } else {
          handleError(data.message || "Failed to load comments");
        }
      } catch (err) {
        console.error(err);
        handleError("Failed to load comments");
      } finally {
        setLoading(false);
      }
    };

    if (videoId) fetchComments();
  }, [videoId]);

  // Add a new comment
  const handleAddComment = async () => {
    if (!text.trim()) return handleError("Comment field is empty");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/add-comment/${videoId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (data.success) {
        handleSuccess("Comment added");
        // Prepend new comment to list
        setComments((prev) => [data.data, ...prev]);
        setText("");
      } else handleError(data.message || "Failed to add comment");
    } catch (err) {
      console.error(err);
      handleError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Toggle like for comment or reply (same endpoint)
  const handleLike = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        const liked = data.data.liked;

        // Update parent comments if id matches a comment
        setComments((prev) =>
          prev.map((c) =>
            c._id === id
              ? {
                  ...c,
                  likes: liked ? [...(c.likes || []), user._id] : (c.likes || []).filter((i) => i !== user._id),
                }
              : c
          )
        );

        // Update replies map (id might be a reply id)
        setReplies((prev) => {
          const updated = {};
          for (const key of Object.keys(prev)) {
            updated[key] = prev[key].map((r) =>
              r._id === id
                ? {
                    ...r,
                    likes: liked ? [...(r.likes || []), user._id] : (r.likes || []).filter((i) => i !== user._id),
                  }
                : r
            );
          }
          return updated;
        });
      } else handleError(data.message || "Failed to toggle like");
    } catch (err) {
      console.error(err);
      handleError("Failed to toggle like");
    }
  };

  // Add reply to a comment or to a reply (backend treats replies as Comment docs with parent pushed)
  const handleAddReply = async (parentId) => {
    const replyText = replyTexts[parentId]?.trim();
    if (!replyText) return handleError("Reply cannot be empty");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reply/${parentId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText }),
      });
      const data = await res.json();
      if (data.success) {
        handleSuccess("Reply added");
        // Ensure replies[parentId] exists and prepend
        setReplies((prev) => ({
          ...prev,
          [parentId]: [data.data, ...(prev[parentId] || [])],
        }));
        // clear input & close box
        setReplyTexts((prev) => ({ ...prev, [parentId]: "" }));
        setReplyBox(null);
        setOpenReplies((prev) => ({ ...prev, [parentId]: true }));
      } else handleError(data.message || "Failed to add reply");
    } catch (err) {
      console.error(err);
      handleError("Failed to add reply");
    } finally {
      setLoading(false);
    }
  };

  // View / fetch replies for a comment
  const handleViewReplies = async (commentId) => {
    // if visible -> hide
    if (openReplies[commentId]) {
      setOpenReplies((prev) => ({ ...prev, [commentId]: false }));
      return;
    }

    // if already loaded -> show
    if (replies[commentId]) {
      setOpenReplies((prev) => ({ ...prev, [commentId]: true }));
      return;
    }

    // otherwise fetch from backend
    try {
      const res = await fetch(`${API_BASE}/reply/${commentId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        // filter duplicates if the comment already had replies in comments list
        const commentObj = comments.find((c) => c._id === commentId) || {};
        const existingIds = new Set((commentObj.replies || []).map((r) => r._id));
        const unique = (data.data || []).filter((r) => !existingIds.has(r._id));

        // If commentObj.replies existed and had replies, prefer showing combined list:
        const combined = (commentObj.replies && commentObj.replies.length)
          ? [...commentObj.replies, ...unique]
          : [...(unique || [])];

        setReplies((prev) => ({ ...prev, [commentId]: combined }));
        setOpenReplies((prev) => ({ ...prev, [commentId]: true }));
      } else handleError(data.message || "Failed to load replies");
    } catch (err) {
      console.error(err);
      handleError("Failed to load replies");
    }
  };

  return (
    <div className="comment-section">
      <h3 className="comment-title">
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </h3>

      {/* Add Comment */}
      <div className="add-cont">
        {user?.avatar ? (
          <img src={user.avatar} alt="avatar" className="comment-avatar" />
        ) : (
          <FaUserCircle size={45} color="white" />
        )}
        <div className="textBox">
          <input
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {text && (
            <div className="btns">
              <button onClick={() => setText("")} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleAddComment} disabled={loading}>
                {loading ? "Posting..." : "Comment"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments list */}
      <div className="comment-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet</p>
        ) : (
          comments.map((comment) => {
            const replyCount = (replies[comment._id]?.length ?? comment.replies?.length ?? 0);
            return (
              <div key={comment._id} className="comment">
                <img
                  src={comment.owner?.avatar || user?.avatar}
                  alt="avatar"
                  className="comment-avatar"
                  onClick={() =>
                    navigate(`/channel/${comment.owner?.username || user?.username}`)
                  }
                />
                <div className="comment-body">
                  <p className="comment-author">
                    {comment.owner?.username || user?.username}
                    <span className="comment-time"> • {timeAgo(comment.createdAt)}</span>
                  </p>
                  <p className="comment-content">{comment.content}</p>

                  <div className="comment-actions">
                    <button onClick={() => handleLike(comment._id)} className="like-btn">
                      {(comment.likes || []).includes(user?._id) ? (
                        <FaThumbsUp size={16} />
                      ) : (
                        <FaRegThumbsUp size={16} />
                      )}
                    </button>
                    <span className="like-count">{(comment.likes || []).length || 0}</span>

                    <button
                      className="reply-btn"
                      onClick={() => setReplyBox(replyBox === comment._id ? null : comment._id)}
                    >
                      Reply
                    </button>
                  </div>

                  {/* reply input under comment */}
                  {replyBox === comment._id && (
                    <div className="reply-box">
                      <div className="reply-input-wrapper">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="avatar" className="reply-avatar" />
                        ) : (
                          <FaUserCircle size={30} color="white" />
                        )}
                        <input
                          type="text"
                          placeholder="Add a reply..."
                          value={replyTexts[comment._id] || ""}
                          onChange={(e) =>
                            setReplyTexts((prev) => ({ ...prev, [comment._id]: e.target.value }))
                          }
                        />
                      </div>
                      <div className="btns">
                        <button onClick={() => setReplyBox(null)} className="cancel-btn">
                          Cancel
                        </button>
                        <button onClick={() => handleAddReply(comment._id)} disabled={loading}>
                          {loading ? "Posting..." : "Reply"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* view replies button */}
                  {replyCount > 0 && (
                    <button className="view-replies-btn" onClick={() => handleViewReplies(comment._id)}>
                      {openReplies[comment._id] ? "Hide Replies" : `View ${replyCount} repl${replyCount > 1 ? "ies" : "y"}`}
                    </button>
                  )}

                  {/* render replies (single source of truth: replies[commentId]) */}
                  {openReplies[comment._id] &&
                    (replies[comment._id] || []).map((reply) => (
                      <div key={reply._id} className="reply">
                        <img src={reply.owner?.avatar || user?.avatar} alt="avatar" className="reply-avatar" />
                        <div className="reply-body">
                          <p className="reply-author">
                            {reply.owner?.username}
                            <span className="reply-time"> • {timeAgo(reply.createdAt)}</span>
                          </p>
                          <p className="reply-content">{reply.content}</p>

                          <div className="comment-actions">
                            <button onClick={() => handleLike(reply._id)} className="like-btn">
                              {(reply.likes || []).includes(user?._id) ? (
                                <FaThumbsUp size={14} />
                              ) : (
                                <FaRegThumbsUp size={14} />
                              )}
                            </button>
                            <span className="like-count">{(reply.likes || []).length || 0}</span>

                            <button
                              className="reply-btn"
                              onClick={() => setReplyBox(replyBox === reply._id ? null : reply._id)}
                            >
                              Reply
                            </button>
                          </div>

                          {/* nested reply input for reply->reply */}
                          {replyBox === reply._id && (
                            <div className="reply-box">
                              <div className="reply-input-wrapper">
                                {user?.avatar ? (
                                  <img src={user.avatar} alt="avatar" className="reply-avatar" />
                                ) : (
                                  <FaUserCircle size={30} color="white" />
                                )}
                                <input
                                  type="text"
                                  placeholder="Reply..."
                                  value={replyTexts[reply._id] || ""}
                                  onChange={(e) =>
                                    setReplyTexts((prev) => ({ ...prev, [reply._id]: e.target.value }))
                                  }
                                />
                              </div>
                              <div className="btns">
                                <button onClick={() => setReplyBox(null)} className="cancel-btn">
                                  Cancel
                                </button>
                                <button onClick={() => handleAddReply(reply._id)} disabled={loading}>
                                  {loading ? "Posting..." : "Reply"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default CommentBox;

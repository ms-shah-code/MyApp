import React, { useEffect, useState } from "react";
import CommentBox from "./CommentBox";

const CommentSection = ({ videoId }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/comments/${videoId}`)
      .then((res) => res.json())
      .then((data) => setComments(data.data))
      .catch(console.error);
  }, [videoId]);

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>Comments</h3>
      <CommentBox videoId={videoId} setComments={setComments} />
      {comments.map((c) => (
        <div key={c._id} style={{ marginTop: "1rem" }}>
          <strong>{c.user.username}</strong>
          <p>{c.text}</p>

          {/* Reply button */}
          <CommentReply parentId={c._id} videoId={videoId} />
        </div>
      ))}
    </div>
  );
};

export default CommentSection;

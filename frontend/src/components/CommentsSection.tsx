import { useEffect, useState, type SyntheticEvent } from "react";
import { getComments, createComment, updateComment } from "../api/CommentApi";
import type { TicketCommentResponse } from "../types/Comment";
import { useAuth } from "../context/AuthContext";

interface CommentSectionProps {
    ticketId: number;
}

export default function CommentsSection({ticketId}: CommentSectionProps){
    const { user } = useAuth();
    const [comments, setComments] = useState<TicketCommentResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newContent, setNewContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');

    const loadComments = async () => {
        setIsLoading(true);
        try{
            const data = await getComments(ticketId);
            setComments(data);
        }finally{
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadComments();
    },[ticketId]);

    const handleAddComment = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newContent.trim()) return;
        setIsPosting(true);
        try{
            await createComment(ticketId, {content: newContent});
            setNewContent('');
            await loadComments();
        }finally{
            setIsPosting(false);
        }
    }

    const startEdit = (comment: TicketCommentResponse) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
    }

    const cancelEdit = () => {
        setEditingId(null);
        setEditContent('');
    }

    const saveEdit = async (commentId: number) => {
        await updateComment(ticketId, {id: commentId, content: editContent});
        setEditingId(null);
        await loadComments();
    };

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="h5 mb-3">Comments</h2>
                <form onSubmit={handleAddComment} className="mb-3">
                    <textarea className="form-control mb-2" rows={2} placeholder="Add Comment" value={newContent} onChange={(e) => setNewContent(e.target.value)} />
                    <button type="submit" className="btn btn-ptimary btn-sm" disabled={isPosting}>
                        {isPosting ? "Adding..." : "Add comment"}
                    </button>
                </form>
                {isLoading ? (
                    <p>Loading...</p>
                ) :  comments.length === 0 ? (
                    <p className="text-muted">No Comments</p>
                ) : (
                    <ul className="list-group">
                        {comments.map((comment) => (
                            <li key={comment.id} className="list-group-item">
                                {editingId === comment.id ? (
                                    <div>
                                        <textarea className="form-control mb-2" rows={2} value={editContent} onChange={(e) => setEditContent(e.target.value)}/>
                                        <button type="button" className="btn btn-primary btn-sm me-2" onClick={() => saveEdit(comment.id)}>Save</button>
                                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                                    </div>
                                ): (
                                    <div>
                                        <div className="d-flex justify-content-between">
                                            <small className="text-muted">
                                                {new Date(comment.createdAt).toLocaleString('en-GB')}
                                            </small>
                                            {user?.id === comment.userId && (
                                                <button type="button" className="btn btn-link btn-sm p-0" onClick={() => startEdit(comment)}>Edit</button>
                                            )}
                                        </div>
                                        <p className="mb-0">{comment.content}</p>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
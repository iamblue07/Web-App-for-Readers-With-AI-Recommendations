import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";
import config from "../utils/config";
import {createToast} from "../utils/createToast";
import "../styles/ForumurileMele.css";

const ForumurileMele = () => {
    const [forumsData, setForumsData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [editingForumId, setEditingForumId] = useState(null);
    const [newTitle, setNewTitle] = useState('');
    const { authData } = useContext(GlobalContext);

    const navigate = useNavigate();

    useEffect(() => {
        if(!authData.token) {
            navigate('/Forumuri');
            return;
        }
        fetchForums();
    }, [authData.token, currentPage, rowsPerPage]);

    const fetchForums = async () => {
        try {
            const response = await fetch(`${config.API_URL}/api/getUserForumuri?page=${currentPage}&limit=${rowsPerPage}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setForumsData(data.forums || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Eroare la preluarea forumurilor:", error);
            setForumsData([]);
            setTotalPages(1);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleEditTitle = (forumId) => {
        setEditingForumId(forumId);
    };

    const handleSaveTitle = async (forumId, newTitle) => {
        try {
            const response = await fetch(`${config.API_URL}/api/forum/changeForumTitle`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                },
                body : JSON.stringify({forumId, newTitle})
            });
            if(response.ok) {
                setForumsData((prev) =>
                    prev.map((forum) =>
                        forum.id === forumId ? { ...forum, titluForum: newTitle } : forum
                    )
                );
                setEditingForumId(null);
                createToast("Succes!", true);
            } else {
                createToast("Eroare la schimbarea titlului!", false);
            }

        } catch (error) {
            console.error("Eroare la salvarea titlului:", error);
        }
    };

    const handleCancelEdit = () => {
        setEditingForumId(null);
    };

    const handleToggleStatus = async (forum, forumId) => {
        try {
            const response = await fetch(`${config.API_URL}/api/forum/toggleForumStatus`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authData.token}`,
                    'Content-Type': 'application/json'
                },
                body : JSON.stringify({newStatus : !forum.esteDeschis, forumId})
            });
            if(response.ok) {
                setForumsData((prev) =>
                    prev.map((forum) =>
                        forum.id === forumId
                            ? { ...forum, esteDeschis: !forum.esteDeschis }
                            : forum
                    )
                );
                createToast("Succes!", true);
            } else {
                createToast("Eroare la schimbarea statusului!", false);
            }
        } catch (error) {
            console.error("Eroare la schimbarea statusului:", error);
        }
    };

    return (
        <div className="ForumurileMele-container">
            <div className="ForumurileMele-forumsList">
                {forumsData.map((forum) => (
                    <div key={forum.id} className="ForumurileMele-forumCard">
                        <div className="ForumurileMele-forumTitle">
                            {editingForumId === forum.id ? (
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => {setNewTitle(e.target.value)}}
                                />
                            ) : (
                                <p>{forum.titluForum}</p>
                            )}
                        </div>

                        {editingForumId !== forum.id ? (
                            <button
                                onClick={() => handleEditTitle(forum.id)}
                                disabled={editingForumId !== null}
                                className="ForumurileMele-changeTitleButton"
                            >
                                Schimba titlu
                            </button>
                        ) : (
                            <>
                                <button onClick={() => handleSaveTitle(forum.id, newTitle)} className="ForumurileMele-saveButton">
                                    Salveaza
                                </button>
                                <button onClick={handleCancelEdit} className="ForumurileMele-cancelButton">
                                    Anuleaza
                                </button>
                            </>
                        )}
                        {forum.esteDeschis ? (<button
                            onClick={() => handleToggleStatus(forum, forum.id)}
                            disabled={editingForumId !== null}
                            className="ForumurileMele-statusButton-Deschis"
                        >Deschis</button>) : (                        <button
                            onClick={() => handleToggleStatus(forum, forum.id)}
                            disabled={editingForumId !== null}
                            className="ForumurileMele-statusButton-Inchis"
                        >Inchis</button>)}
                    </div>
                ))}
            </div>

            <div className="ForumurileMele-pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="ForumurileMele-prevButton">
                    Prev
                </button>
                <span className="ForumurileMele-pageInfo">Page {currentPage} of {totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="ForumurileMele-nextButton">
                    Next
                </button>
            </div>
        </div>
    );
};

export default ForumurileMele;

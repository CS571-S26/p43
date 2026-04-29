import { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import AppNavbar from "./components/AppNavbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import MyProjectsPage from "./pages/MyProjectsPage";
import FeedbackBoardPage from "./pages/FeedbackBoardPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import AuthPage from "./pages/AuthPage";
import { db } from "./lib/firebase";
import { useAuth } from "./contexts/auth-context";
import "./App.css";

function App() {
  const [projects, setProjects] = useState([]);
  const [loadedProjectsKey, setLoadedProjectsKey] = useState("");
  const { currentUser, authLoading } = useAuth();
  const projectsRequestKey = currentUser
    ? `${currentUser.uid}:${currentUser.metadata?.lastLoginAt ?? ""}`
    : "";
  const projectsLoading =
    Boolean(currentUser) && loadedProjectsKey !== projectsRequestKey;

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    if (!currentUser) {
      return undefined;
    }

    const projectsCollection = collection(db, "projects");

    const unsubscribe = onSnapshot(projectsCollection, (snapshot) => {
      const nextProjects = snapshot.docs
        .map((projectDoc) => ({
          id: projectDoc.id,
          ...projectDoc.data(),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setProjects(nextProjects);
      setLoadedProjectsKey(projectsRequestKey);
    });

    return unsubscribe;
  }, [authLoading, currentUser, projectsRequestKey]);

  const handleAddProject = async (newProject) => {
    if (!currentUser) {
      throw new Error("You must be logged in to create a project.");
    }

    const projectRef = await addDoc(collection(db, "projects"), {
      name: newProject.name,
      category: newProject.category,
      owner: newProject.owner,
      summary: newProject.summary,
      implementedIdeas: [],
      ticketCount: 0,
      createdByUid: currentUser.uid,
      createdByEmail: currentUser.email ?? "",
      createdAt: serverTimestamp(),
    });

    return projectRef.id;
  };

  const handleEditProject = async (projectId, updatedProject) => {
    if (!currentUser) {
      throw new Error("You must be logged in to edit a project.");
    }

    const projectRef = doc(db, "projects", projectId);
    const projectSnapshot = await getDoc(projectRef);

    if (!projectSnapshot.exists()) {
      throw new Error("This project no longer exists.");
    }

    if (projectSnapshot.data().createdByUid !== currentUser.uid) {
      throw new Error("Only the project owner can edit this project.");
    }

    await updateDoc(projectRef, {
      name: updatedProject.name,
      category: updatedProject.category,
      owner: updatedProject.owner,
      summary: updatedProject.summary,
    });
  };

  const handleAddTicket = async (projectId, newTicket) => {
    if (!currentUser) {
      throw new Error("You must be logged in to add an idea.");
    }

    const ticketRef = doc(collection(db, "projects", projectId, "tickets"));
    const projectRef = doc(db, "projects", projectId);
    const batch = writeBatch(db);

    batch.set(ticketRef, {
      title: newTicket.title,
      description: newTicket.description,
      category: newTicket.category,
      votes: 0,
      commentCount: 0,
      createdByUid: currentUser.uid,
      createdByEmail: currentUser.email ?? "",
      createdAt: serverTimestamp(),
    });

    batch.update(projectRef, {
      ticketCount: increment(1),
    });

    await batch.commit();
  };

  const handleAddComment = async (projectId, ticketId, text) => {
    if (!currentUser) {
      throw new Error("You must be logged in to comment.");
    }

    const commentText = text.trim();

    if (!commentText) {
      throw new Error("Comment text is required.");
    }

    const ticketRef = doc(db, "projects", projectId, "tickets", ticketId);
    const commentRef = doc(
      collection(db, "projects", projectId, "tickets", ticketId, "comments"),
    );
    const batch = writeBatch(db);

    batch.set(commentRef, {
      text: commentText,
      createdByUid: currentUser.uid,
      createdByEmail: currentUser.email ?? "",
      createdAt: serverTimestamp(),
    });

    batch.update(ticketRef, {
      commentCount: increment(1),
    });

    await batch.commit();
  };

  const handleEditTicket = async (projectId, ticketId, updatedTicket) => {
    if (!currentUser) {
      throw new Error("You must be logged in to edit an idea.");
    }

    const ticketRef = doc(db, "projects", projectId, "tickets", ticketId);
    const ticketSnapshot = await getDoc(ticketRef);

    if (!ticketSnapshot.exists()) {
      throw new Error("This idea no longer exists.");
    }

    if (ticketSnapshot.data().createdByUid !== currentUser.uid) {
      throw new Error("Only the idea creator can edit this idea.");
    }

    await updateDoc(ticketRef, {
      title: updatedTicket.title,
      description: updatedTicket.description,
      category: updatedTicket.category,
    });
  };

  const handleVote = async (projectId, ticketId, currentVote, voteType) => {
    if (!currentUser) {
      throw new Error("You must be logged in to vote.");
    }

    let nextVote = currentVote;
    let delta = 0;

    if (voteType === "up") {
      if (currentVote === 1) {
        nextVote = 0;
        delta = -1;
      } else if (currentVote === 0) {
        nextVote = 1;
        delta = 1;
      } else {
        nextVote = 1;
        delta = 2;
      }
    }

    if (voteType === "down") {
      if (currentVote === -1) {
        nextVote = 0;
        delta = 1;
      } else if (currentVote === 0) {
        nextVote = -1;
        delta = -1;
      } else {
        nextVote = -1;
        delta = -2;
      }
    }

    const ticketRef = doc(db, "projects", projectId, "tickets", ticketId);
    const voteRef = doc(
      db,
      "projects",
      projectId,
      "votes",
      `${ticketId}_${currentUser.uid}`,
    );

    await runTransaction(db, async (transaction) => {
      const ticketSnapshot = await transaction.get(ticketRef);

      if (!ticketSnapshot.exists()) {
        throw new Error("The ticket no longer exists.");
      }

      const currentVotes = ticketSnapshot.data().votes ?? 0;

      transaction.update(ticketRef, {
        votes: currentVotes + delta,
      });

      if (nextVote === 0) {
        transaction.delete(voteRef);
      } else {
        transaction.set(voteRef, {
          ticketId,
          userId: currentUser.uid,
          value: nextVote,
          updatedAt: serverTimestamp(),
        });
      }
    });
  };

  const handleDeleteProject = async (projectId) => {
    if (!currentUser) {
      throw new Error("You must be logged in to delete a project.");
    }

    const projectRef = doc(db, "projects", projectId);
    const projectSnapshot = await getDoc(projectRef);

    if (!projectSnapshot.exists()) {
      throw new Error("This project no longer exists.");
    }

    if (projectSnapshot.data().createdByUid !== currentUser.uid) {
      throw new Error("Only the creator of this project can delete it.");
    }

    const ticketsSnapshot = await getDocs(
      collection(db, "projects", projectId, "tickets"),
    );
    const ticketCommentsSnapshots = await Promise.all(
      ticketsSnapshot.docs.map((ticketDoc) =>
        getDocs(
          collection(
            db,
            "projects",
            projectId,
            "tickets",
            ticketDoc.id,
            "comments",
          ),
        ),
      ),
    );

    const votesSnapshot = await getDocs(
      collection(db, "projects", projectId, "votes"),
    );

    const batch = writeBatch(db);

    ticketsSnapshot.forEach((ticketDoc) => {
      batch.delete(ticketDoc.ref);
    });

    ticketCommentsSnapshots.forEach((commentsSnapshot) => {
      commentsSnapshot.forEach((commentDoc) => {
        batch.delete(commentDoc.ref);
      });
    });

    votesSnapshot.forEach((voteDoc) => {
      batch.delete(voteDoc.ref);
    });

    batch.delete(projectRef);

    await batch.commit();
  };

  const handleDeleteTicket = async (projectId, ticketId) => {
    if (!currentUser) {
      throw new Error("You must be logged in to delete an idea.");
    }

    const projectRef = doc(db, "projects", projectId);
    const ticketRef = doc(db, "projects", projectId, "tickets", ticketId);

    const [projectSnapshot, ticketSnapshot] = await Promise.all([
      getDoc(projectRef),
      getDoc(ticketRef),
    ]);

    if (!projectSnapshot.exists()) {
      throw new Error("This project no longer exists.");
    }

    if (!ticketSnapshot.exists()) {
      throw new Error("This idea no longer exists.");
    }

    const projectData = projectSnapshot.data();
    const ticketData = ticketSnapshot.data();

    const canDeleteIdea =
      ticketData.createdByUid === currentUser.uid ||
      projectData.createdByUid === currentUser.uid;

    if (!canDeleteIdea) {
      throw new Error(
        "Only the idea creator or the project owner can delete this idea.",
      );
    }

    const relatedVotesSnapshot = await getDocs(
      query(
        collection(db, "projects", projectId, "votes"),
        where("ticketId", "==", ticketId),
      ),
    );
    const commentsSnapshot = await getDocs(
      collection(db, "projects", projectId, "tickets", ticketId, "comments"),
    );

    const batch = writeBatch(db);

    relatedVotesSnapshot.forEach((voteDoc) => {
      batch.delete(voteDoc.ref);
    });

    commentsSnapshot.forEach((commentDoc) => {
      batch.delete(commentDoc.ref);
    });

    batch.delete(ticketRef);

    batch.update(projectRef, {
      ticketCount: increment(-1),
    });

    await batch.commit();
  };

  const handleMarkIdeaImplemented = async (projectId, ticketId) => {
    if (!currentUser) {
      throw new Error("You must be logged in to update an idea.");
    }

    const projectRef = doc(db, "projects", projectId);
    const ticketRef = doc(db, "projects", projectId, "tickets", ticketId);

    const [projectSnapshot, ticketSnapshot] = await Promise.all([
      getDoc(projectRef),
      getDoc(ticketRef),
    ]);

    if (!projectSnapshot.exists()) {
      throw new Error("This project no longer exists.");
    }

    if (!ticketSnapshot.exists()) {
      throw new Error("This idea no longer exists.");
    }

    const projectData = projectSnapshot.data();
    const ticketData = ticketSnapshot.data();

    if (projectData.createdByUid !== currentUser.uid) {
      throw new Error("Only the project owner can mark ideas as implemented.");
    }

    const relatedVotesSnapshot = await getDocs(
      query(
        collection(db, "projects", projectId, "votes"),
        where("ticketId", "==", ticketId),
      ),
    );
    const commentsSnapshot = await getDocs(
      query(
        collection(db, "projects", projectId, "tickets", ticketId, "comments"),
        orderBy("createdAt", "asc"),
      ),
    );

    const batch = writeBatch(db);
    let implementedIdeaUpvotes = 0;
    let implementedIdeaDownvotes = 0;
    const archivedComments = commentsSnapshot.docs.map((commentDoc) => ({
      id: commentDoc.id,
      ...commentDoc.data(),
    }));

    relatedVotesSnapshot.forEach((voteDoc) => {
      const voteValue = voteDoc.data().value;

      if (voteValue === 1) {
        implementedIdeaUpvotes += 1;
      } else if (voteValue === -1) {
        implementedIdeaDownvotes += 1;
      }
    });

    batch.update(projectRef, {
      implementedIdeas: arrayUnion({
        id: ticketId,
        title: ticketData.title,
        description: ticketData.description,
        category: ticketData.category ?? "",
        votes: ticketData.votes ?? 0,
        upvotes: implementedIdeaUpvotes,
        downvotes: implementedIdeaDownvotes,
        commentCount: archivedComments.length,
        comments: archivedComments,
        createdByUid: ticketData.createdByUid ?? "",
        createdByEmail: ticketData.createdByEmail ?? "",
        implementedAt: new Date().toISOString(),
      }),
      ticketCount: increment(-1),
    });

    relatedVotesSnapshot.forEach((voteDoc) => {
      batch.delete(voteDoc.ref);
    });

    commentsSnapshot.forEach((commentDoc) => {
      batch.delete(commentDoc.ref);
    });

    batch.delete(ticketRef);

    await batch.commit();
  };

  const handleRestoreImplementedIdea = async (projectId, ticketId) => {
    if (!currentUser) {
      throw new Error("You must be logged in to update an idea.");
    }

    const projectRef = doc(db, "projects", projectId);
    const ticketRef = doc(db, "projects", projectId, "tickets", ticketId);

    const [projectSnapshot, ticketSnapshot] = await Promise.all([
      getDoc(projectRef),
      getDoc(ticketRef),
    ]);

    if (!projectSnapshot.exists()) {
      throw new Error("This project no longer exists.");
    }

    if (ticketSnapshot.exists()) {
      throw new Error("This idea has already been restored.");
    }

    const projectData = projectSnapshot.data();

    if (projectData.createdByUid !== currentUser.uid) {
      throw new Error(
        "Only the project owner can move ideas back to proposed.",
      );
    }

    const implementedIdeas = projectData.implementedIdeas ?? [];
    const implementedIdea = implementedIdeas.find((idea) => idea.id === ticketId);

    if (!implementedIdea) {
      throw new Error("This implemented idea no longer exists.");
    }

    const remainingImplementedIdeas = implementedIdeas.filter(
      (idea) => idea.id !== ticketId,
    );
    const restoredComments = implementedIdea.comments ?? [];
    const batch = writeBatch(db);

    batch.set(ticketRef, {
      title: implementedIdea.title ?? "",
      description: implementedIdea.description ?? "",
      category: implementedIdea.category ?? "",
      votes: implementedIdea.votes ?? 0,
      commentCount:
        implementedIdea.commentCount ?? restoredComments.length ?? 0,
      createdByUid: implementedIdea.createdByUid ?? currentUser.uid,
      createdByEmail:
        implementedIdea.createdByEmail ?? currentUser.email ?? "",
      createdAt: serverTimestamp(),
    });

    restoredComments.forEach((comment, index) => {
      const restoredCommentRef = doc(
        db,
        "projects",
        projectId,
        "tickets",
        ticketId,
        "comments",
        comment.id ?? `restored-${index}`,
      );

      batch.set(restoredCommentRef, {
        text: comment.text ?? "",
        createdByUid: comment.createdByUid ?? currentUser.uid,
        createdByEmail: comment.createdByEmail ?? "",
        createdAt: comment.createdAt ?? serverTimestamp(),
      });
    });

    batch.update(projectRef, {
      implementedIdeas: remainingImplementedIdeas,
      ticketCount: increment(1),
    });

    await batch.commit();
  };

  return (
    <div className="app-shell">
      <AppNavbar />
      <Container className="py-4">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                projects={projects}
                projectsLoading={projectsLoading}
                currentUser={currentUser}
                authLoading={authLoading}
              />
            }
          />

          <Route
            path="/auth"
            element={
              authLoading ? (
                <div className="d-flex justify-content-center py-5">
                  <Spinner animation="border" role="status" />
                </div>
              ) : currentUser ? (
                <Navigate to="/" replace />
              ) : (
                <AuthPage />
              )
            }
          />

          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateProjectPage onAddProject={handleAddProject} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-projects"
            element={
              <ProtectedRoute>
                <MyProjectsPage
                  projects={projects}
                  projectsLoading={projectsLoading}
                  currentUser={currentUser}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/board/:projectId"
            element={
              <ProtectedRoute>
                <FeedbackBoardPage
                  projects={projects}
                  projectsLoading={projectsLoading}
                  currentUser={currentUser}
                  onAddTicket={handleAddTicket}
                  onAddComment={handleAddComment}
                  onEditProject={handleEditProject}
                  onEditTicket={handleEditTicket}
                  onVote={handleVote}
                  onDeleteProject={handleDeleteProject}
                  onDeleteTicket={handleDeleteTicket}
                  onMarkIdeaImplemented={handleMarkIdeaImplemented}
                  onRestoreImplementedIdea={handleRestoreImplementedIdea}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
    </div>
  );
}

export default App;

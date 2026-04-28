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
  query,
  runTransaction,
  serverTimestamp,
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
import { useAuth } from "./contexts/AuthContext";
import "./App.css";

function App() {
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const { currentUser, authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    if (!currentUser) {
      setProjects([]);
      setProjectsLoading(false);
      return undefined;
    }

    setProjectsLoading(true);

    const projectsCollection = collection(db, "projects");

    const unsubscribe = onSnapshot(projectsCollection, (snapshot) => {
      const nextProjects = snapshot.docs
        .map((projectDoc) => ({
          id: projectDoc.id,
          ...projectDoc.data(),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setProjects(nextProjects);
      setProjectsLoading(false);
    });

    return unsubscribe;
  }, [authLoading, currentUser]);

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
      votes: 0,
      createdByUid: currentUser.uid,
      createdByEmail: currentUser.email ?? "",
      createdAt: serverTimestamp(),
    });

    batch.update(projectRef, {
      ticketCount: increment(1),
    });

    await batch.commit();
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

    const votesSnapshot = await getDocs(
      collection(db, "projects", projectId, "votes"),
    );

    const batch = writeBatch(db);

    ticketsSnapshot.forEach((ticketDoc) => {
      batch.delete(ticketDoc.ref);
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

    const batch = writeBatch(db);

    relatedVotesSnapshot.forEach((voteDoc) => {
      batch.delete(voteDoc.ref);
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

    const batch = writeBatch(db);

    batch.update(projectRef, {
      implementedIdeas: arrayUnion({
        id: ticketId,
        title: ticketData.title,
        description: ticketData.description,
        createdByUid: ticketData.createdByUid ?? "",
        createdByEmail: ticketData.createdByEmail ?? "",
        implementedAt: new Date().toISOString(),
      }),
      ticketCount: increment(-1),
    });

    relatedVotesSnapshot.forEach((voteDoc) => {
      batch.delete(voteDoc.ref);
    });

    batch.delete(ticketRef);

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
                  onVote={handleVote}
                  onDeleteProject={handleDeleteProject}
                  onDeleteTicket={handleDeleteTicket}
                  onMarkIdeaImplemented={handleMarkIdeaImplemented}
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
import { useEffect, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import AppNavbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import FeedbackBoardPage from './pages/FeedbackBoardPage';
import CreateProjectPage from './pages/CreateProjectPage';
import AuthPage from './pages/AuthPage';
import { initialProjects } from './data/mockProjects';
import { db } from './lib/firebase';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [seedFinished, setSeedFinished] = useState(false);
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

    const projectsCollection = collection(db, 'projects');

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

  useEffect(() => {
    if (!currentUser) {
      setSeedFinished(false);
      return;
    }

    if (authLoading || seedFinished) {
      return;
    }

    const seedMockProjectsIfNeeded = async () => {
      const existingProjectsSnapshot = await getDocs(
        query(collection(db, 'projects'), limit(1)),
      );

      if (!existingProjectsSnapshot.empty) {
        setSeedFinished(true);
        return;
      }

      const batch = writeBatch(db);

      initialProjects.forEach((project) => {
        const projectRef = doc(db, 'projects', project.id);

        batch.set(projectRef, {
          name: project.name,
          category: project.category,
          summary: project.summary,
          owner: project.owner,
          implementedIdeas: project.implementedIdeas ?? [],
          ticketCount: project.tickets?.length ?? 0,
          createdByUid: currentUser.uid,
          createdByEmail: currentUser.email ?? '',
          createdAt: serverTimestamp(),
        });

        (project.tickets ?? []).forEach((ticket) => {
          const ticketRef = doc(db, 'projects', project.id, 'tickets', String(ticket.id));

          batch.set(ticketRef, {
            title: ticket.title,
            description: ticket.description,
            votes: ticket.votes ?? 0,
            createdAt: serverTimestamp(),
            createdByUid: currentUser.uid,
            createdByEmail: currentUser.email ?? '',
          });
        });
      });

      await batch.commit();
      setSeedFinished(true);
    };

    seedMockProjectsIfNeeded().catch((error) => {
      console.error('Could not seed starter projects:', error);
      setSeedFinished(true);
    });
  }, [authLoading, currentUser, seedFinished]);

  const handleAddProject = async (newProject) => {
    if (!currentUser) {
      throw new Error('You must be logged in to create a project.');
    }

    const projectRef = await addDoc(collection(db, 'projects'), {
      name: newProject.name,
      category: newProject.category,
      owner: newProject.owner,
      summary: newProject.summary,
      implementedIdeas: [],
      ticketCount: 0,
      createdByUid: currentUser.uid,
      createdByEmail: currentUser.email ?? '',
      createdAt: serverTimestamp(),
    });

    return projectRef.id;
  };

  const handleAddTicket = async (projectId, newTicket) => {
    if (!currentUser) {
      throw new Error('You must be logged in to add an idea.');
    }

    const ticketRef = doc(collection(db, 'projects', projectId, 'tickets'));
    const projectRef = doc(db, 'projects', projectId);
    const batch = writeBatch(db);

    batch.set(ticketRef, {
      title: newTicket.title,
      description: newTicket.description,
      votes: 0,
      createdByUid: currentUser.uid,
      createdByEmail: currentUser.email ?? '',
      createdAt: serverTimestamp(),
    });

    batch.update(projectRef, {
      ticketCount: increment(1),
    });

    await batch.commit();
  };

  const handleVote = async (projectId, ticketId, currentVote, voteType) => {
    if (!currentUser) {
      throw new Error('You must be logged in to vote.');
    }

    let nextVote = currentVote;
    let delta = 0;

    if (voteType === 'up') {
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

    if (voteType === 'down') {
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

    const ticketRef = doc(db, 'projects', projectId, 'tickets', ticketId);
    const voteRef = doc(db, 'projects', projectId, 'votes', `${ticketId}_${currentUser.uid}`);

    await runTransaction(db, async (transaction) => {
      const ticketSnapshot = await transaction.get(ticketRef);

      if (!ticketSnapshot.exists()) {
        throw new Error('The ticket no longer exists.');
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
            path="/board/:projectId"
            element={
              <ProtectedRoute>
                <FeedbackBoardPage
                  projects={projects}
                  projectsLoading={projectsLoading}
                  currentUser={currentUser}
                  onAddTicket={handleAddTicket}
                  onVote={handleVote}
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
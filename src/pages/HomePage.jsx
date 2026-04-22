import { useState } from "react";
import { Alert, Form, Spinner } from "react-bootstrap";
import ProductCard from "../components/ProductCard";

function HomePage({ projects, projectsLoading, currentUser, authLoading }) {
  const [searchTerm, setSearchTerm] = useState("");

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredProjects = projects.filter((project) => {
    if (!normalizedSearch) {
      return true;
    }

    return [
      project.name,
      project.category,
      project.owner,
      project.summary,
    ].some((field) => (field ?? "").toLowerCase().includes(normalizedSearch));
  });

  return (
    <div>
      <section className="hero-section mb-5">
        <div className="hero-content">
          <p className="hero-kicker">Collect ideas. Organize feedback.</p>
          <h1 className="hero-title">
            Build better products with shared feedback.
          </h1>
          <p className="hero-text">
            This version uses Firebase so multiple accounts can see the same
            boards, submit ideas, and vote on features together.
          </p>
        </div>
      </section>

      <section id="projects-section" className="mb-5">
        <div className="section-header">
          <div>
            <h2 className="section-title">Projects</h2>
            <p className="section-subtitle">
              Pick a project to open its feedback board.
            </p>
          </div>
        </div>

        {authLoading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" role="status" />
          </div>
        ) : !currentUser ? (
          <Alert variant="light" className="border shadow-sm mt-4">
            <strong>Sign in to view project boards.</strong>
            <div className="mt-2 text-muted">
              You need an account to browse projects, open boards, submit ideas,
              and vote.
            </div>
          </Alert>
        ) : projectsLoading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" role="status" />
          </div>
        ) : projects.length > 0 ? (
          <>
            <div className="project-search-wrapper mb-4">
              <Form.Control
                type="search"
                placeholder="Search projects by name, category, owner, or summary..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="project-search-input"
              />
              <p className="project-search-results mb-0 mt-2">
                Showing {filteredProjects.length} of {projects.length} projects
              </p>
            </div>

            {filteredProjects.length > 0 ? (
              <div className="row g-4">
                {filteredProjects.map((project) => (
                  <div className="col-md-6 col-lg-4" key={project.id}>
                    <ProductCard project={project} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state mt-4">
                No projects matched your search.
              </div>
            )}
          </>
        ) : (
          <div className="empty-state mt-4">
            No projects exist yet. Create the first project after you sign in.
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;

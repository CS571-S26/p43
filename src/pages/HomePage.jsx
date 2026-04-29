import { useState } from "react";
import { Alert, Form, Spinner } from "react-bootstrap";
import ProductCard from "../components/ProductCard";
import { PROJECT_CATEGORIES } from "../constants/categories";

function HomePage({ projects, projectsLoading, currentUser, authLoading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      !categoryFilter || project.category === categoryFilter;

    if (!matchesCategory) {
      return false;
    }

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
            <div className="project-filter-bar mb-4">
              <div className="project-filter-grid">
                <div className="project-filter-column">
                  <Form.Group
                    controlId="projectSearch"
                    className="project-filter-field"
                  >
                    <Form.Label>Search projects</Form.Label>
                    <Form.Control
                      type="search"
                      placeholder="Search projects by name, category, owner, or summary..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="project-search-input"
                    />
                    <p className="project-filter-meta project-search-results mb-0">
                      Showing {filteredProjects.length} of {projects.length}{" "}
                      projects
                    </p>
                  </Form.Group>
                </div>

                <div className="project-filter-column">
                  <Form.Group
                    controlId="projectCategoryFilter"
                    className="project-filter-field"
                  >
                    <Form.Label>Project category</Form.Label>
                    <Form.Select
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value)}
                    >
                      <option value="">All categories</option>
                      {PROJECT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text muted className="project-filter-meta">
                      Narrow the list to the project types you care about.
                    </Form.Text>
                  </Form.Group>
                </div>
              </div>
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
                {normalizedSearch || categoryFilter
                  ? "No projects matched your current filters."
                  : "No projects matched your search."}
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

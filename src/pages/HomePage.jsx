import ProductCard from '../components/ProductCard'

function HomePage({ projects }) {
  return (
    <div>
      <section className="hero-section mb-5">
        <div className="hero-content">
          <p className="hero-kicker">Collect ideas. Organize feedback.</p>
          <h1 className="hero-title">Build better products with shared feedback.</h1>
          <p className="hero-text">
            This starter app lets users explore products and open a simple
            feedback board to view feature request tickets.
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

        <div className="row g-4">
          {projects.map((project) => (
            <div className="col-md-6 col-lg-4" key={project.id}>
              <ProductCard project={project} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
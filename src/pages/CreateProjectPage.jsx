import ProductForm from '../components/ProductForm';

function CreateProjectPage({ onAddProject }) {
  return (
    <section className="mb-4">
      <div className="section-header">
        <div>
          <h2 className="section-title">Create a New Project</h2>
          <p className="section-subtitle">
            Add a basic project to the board using local state.
          </p>
        </div>
      </div>

      <ProductForm onAddProject={onAddProject} />
    </section>
  );
}

export default CreateProjectPage;
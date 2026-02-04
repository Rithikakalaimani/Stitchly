import { useState, useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import { api } from '../api';
import './Designs.css';

const MAX_IMAGE_SIZE = 800;
const JPEG_QUALITY = 0.7;
const MAX_IMAGES_PER_DESIGN = 3;

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_IMAGE_SIZE) / width);
          width = MAX_IMAGE_SIZE;
        } else {
          width = Math.round((width * MAX_IMAGE_SIZE) / height);
          height = MAX_IMAGE_SIZE;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Invalid image'));
    };
    img.src = url;
  });
}

export default function Designs() {
  const cameraInputRefs = useRef([]);
  const galleryInputRefs = useRef([]);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  // Add form state: name, type, images (array of up to 3)
  const [addName, setAddName] = useState('');
  const [addType, setAddType] = useState('');
  const [addImages, setAddImages] = useState([]);

  const load = () => api.designs.list().then(setDesigns).catch((e) => setError(e.message));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const setImageRef = (ref, index) => {
    cameraInputRefs.current[index] = ref;
  };
  const setGalleryRef = (ref, index) => {
    galleryInputRefs.current[index] = ref;
  };

  const handlePhotoSelect = async (e, slotIndex) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    e.target.value = '';
    try {
      const dataUrl = await resizeImage(file);
      setAddImages((prev) => {
        const next = [...prev];
        next[slotIndex] = dataUrl;
        return next.slice(0, MAX_IMAGES_PER_DESIGN);
      });
      setError(null);
    } catch (err) {
      setError('Could not process image. Try another.');
    }
  };

  const removeAddImage = (index) => {
    setAddImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddDesign = (e) => {
    e.preventDefault();
    const name = addName.trim();
    if (!name) {
      setError('Enter a name for the design');
      return;
    }
    const images = addImages.filter((i) => i);
    if (images.length === 0) {
      setError('Add at least one image (take or add photo)');
      return;
    }
    setError(null);
    setSubmitting(true);
    api.designs
      .create({ name, type: addType.trim(), images })
      .then(() => {
        setAddName('');
        setAddType('');
        setAddImages([]);
        setShowAddForm(false);
        load();
      })
      .catch((e) => setError(e.message))
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (designId) => {
    if (!window.confirm('Remove this design from the gallery?')) return;
    setDeletingId(designId);
    api.designs
      .delete(designId)
      .then(() => load())
      .catch((e) => setError(e.message))
      .finally(() => setDeletingId(null));
  };

  const openAddForm = () => {
    setShowAddForm(true);
    setAddName('');
    setAddType('');
    setAddImages([]);
    setError(null);
  };

  if (loading) return <div className="page-loading">Loading…</div>;

  return (
    <div className="designs-page">
      <div className="designs-header">
        <h1 className="page-title">Design gallery</h1>
        <p className="designs-intro">Add blouse designs or other unique designs with 1–3 photos.</p>
        <button type="button" className="btn btn-primary btn-add-design" onClick={openAddForm}>
          Add design
        </button>
      </div>

      {error && <div className="banner error">{error}</div>}

      {showAddForm && (
        <div className="designs-add-form card">
          <h2>New design</h2>
          <form onSubmit={handleAddDesign}>
            <div className="form-row">
              <label>Name *</label>
              <input
                type="text"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="e.g. Fancy blouse, Saree fall design"
                required
              />
            </div>
            <div className="form-row">
              <label>Type (optional)</label>
              <input
                type="text"
                value={addType}
                onChange={(e) => setAddType(e.target.value)}
                placeholder="e.g. blouse, saree fall"
              />
            </div>
            <div className="form-row images-row">
              <label>Photos (1–3 different views) *</label>
              <div className="design-image-slots">
                {[0, 1, 2].map((slotIndex) => (
                  <div key={slotIndex} className="design-slot">
                    <input
                      ref={(el) => setImageRef(el, slotIndex)}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="photo-input-hidden"
                      onChange={(e) => handlePhotoSelect(e, slotIndex)}
                      aria-label={`Take photo view ${slotIndex + 1}`}
                    />
                    <input
                      ref={(el) => setGalleryRef(el, slotIndex)}
                      type="file"
                      accept="image/*"
                      className="photo-input-hidden"
                      onChange={(e) => handlePhotoSelect(e, slotIndex)}
                      aria-label={`Add photo view ${slotIndex + 1}`}
                    />
                    {addImages[slotIndex] ? (
                      <div className="design-slot-preview">
                        <img src={addImages[slotIndex]} alt="" />
                        <button
                          type="button"
                          className="design-slot-remove"
                          onClick={() => removeAddImage(slotIndex)}
                          aria-label="Remove photo"
                        >
                          <IoClose aria-hidden />
                        </button>
                      </div>
                    ) : (
                      <div className="design-slot-empty">
                        <button
                          type="button"
                          className="btn btn-slot-take"
                          onClick={() => cameraInputRefs.current[slotIndex]?.click()}
                        >
                          Take photo
                        </button>
                        <button
                          type="button"
                          className="btn btn-slot-add"
                          onClick={() => galleryInputRefs.current[slotIndex]?.click()}
                        >
                          Add photo
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting || addImages.filter(Boolean).length === 0}>
                {submitting ? 'Adding…' : 'Add design'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowAddForm(false)} disabled={submitting}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {designs.length === 0 && !showAddForm ? (
        <div className="designs-empty card">
          <p>No designs yet. Tap <strong>Add design</strong> to add blouse or other designs with 1–3 photos to show customers later.</p>
        </div>
      ) : (
        <div className="designs-grid">
          {designs.map((d) => (
            <div key={d.design_id} className="design-card card">
              <div className="design-card-header">
                <h3 className="design-card-name">{d.name}</h3>
                {d.type ? <span className="design-card-type">{d.type}</span> : null}
              </div>
              <div className="design-card-images">
                {(d.images || []).map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className="design-card-thumb"
                    onClick={() => setZoomedImage(img)}
                    aria-label="View full size"
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="design-card-delete"
                onClick={() => handleDelete(d.design_id)}
                disabled={deletingId === d.design_id}
                aria-label="Remove design"
              >
                {deletingId === d.design_id ? '…' : <IoClose className="design-delete-icon" aria-hidden />}
              </button>
            </div>
          ))}
        </div>
      )}

      {zoomedImage && (
        <div
          className="photo-zoom-overlay"
          onClick={() => setZoomedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo zoom view"
        >
          <div className="photo-zoom-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="photo-zoom-close"
              onClick={() => setZoomedImage(null)}
              aria-label="Close"
            >
              <IoClose className="photo-zoom-close-icon" aria-hidden />
            </button>
            <img src={zoomedImage} alt="Enlarged view" className="photo-zoom-image" />
          </div>
        </div>
      )}
    </div>
  );
}

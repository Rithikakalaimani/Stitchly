const express = require('express');
const router = express.Router();
const Design = require('../models/Design');
const { genId } = require('../utils/ids');

const MAX_IMAGES = 3;

router.get('/', async (req, res) => {
  try {
    const designs = await Design.find().sort({ createdAt: -1 });
    res.json(designs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type, images } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name required' });
    }
    const imageList = Array.isArray(images) ? images.filter((i) => i && typeof i === 'string').slice(0, MAX_IMAGES) : [];
    if (imageList.length === 0) {
      return res.status(400).json({ error: 'Add at least one image' });
    }
    const design_id = genId('D');
    const design = await Design.create({
      design_id,
      name: name.trim(),
      type: (type && typeof type === 'string' ? type.trim() : '') || '',
      images: imageList,
    });
    res.status(201).json(design);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:design_id', async (req, res) => {
  try {
    const design = await Design.findOne({ design_id: req.params.design_id });
    if (!design) return res.status(404).json({ error: 'Design not found' });
    res.json(design);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:design_id', async (req, res) => {
  try {
    const result = await Design.deleteOne({ design_id: req.params.design_id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Design not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

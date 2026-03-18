const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// GET all events — public
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    const eventsWithStatus = events.map(e => {
      const obj = e.toObject();
      obj.computedStatus = e.getComputedStatus();
      return obj;
    });
    res.json(eventsWithStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single event — public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    const obj = event.toObject();
    obj.computedStatus = event.getComputedStatus();
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create event — admin
router.post('/', auth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'certificateImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = '/uploads/' + req.files.image[0].filename;
    if (req.files?.certificateImage) data.certificateImage = '/uploads/' + req.files.certificateImage[0].filename;
    if (req.files?.galleryImages) data.galleryImages = req.files.galleryImages.map(f => '/uploads/' + f.filename);
    
    ['topics', 'benefits', 'galleryImages'].forEach(key => {
      if (typeof data[key] === 'string' && data[key].startsWith('[')) {
        try { data[key] = JSON.parse(data[key]); } catch (e) {}
      }
    });

    const event = new Event(data);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update event — admin
router.put('/:id', auth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'certificateImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image) data.image = '/uploads/' + req.files.image[0].filename;
    if (req.files?.certificateImage) data.certificateImage = '/uploads/' + req.files.certificateImage[0].filename;
    if (req.files?.galleryImages) data.galleryImages = req.files.galleryImages.map(f => '/uploads/' + f.filename);
    
    ['topics', 'benefits', 'galleryImages'].forEach(key => {
      if (typeof data[key] === 'string' && data[key].startsWith('[')) {
        try { data[key] = JSON.parse(data[key]); } catch (e) {}
      }
    });

    const event = await Event.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE event — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

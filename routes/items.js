const express = require('express');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.get('/items', async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    const type = req.query.type || 'All';
    const category = req.query.category || 'All';

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (type !== 'All') {
      filter.type = type;
    }

    if (category !== 'All') {
      filter.category = category;
    }

    const items = await Item.find(filter)
      .populate('reporter', 'name roll email')
      .sort({ createdAt: -1 });

    const categories = await Item.distinct('category');

    res.render('browse', {
      title: 'Browse Items',
      items,
      categories,
      search,
      type,
      category
    });
  } catch (error) {
    console.error('Browse items error:', error.message);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Unable to load items right now. Please try again later.'
    });
  }
});

router.get('/report', isAuthenticated, async (req, res) => {
  try {
    const categories = [
      'Electronics',
      'Accessories',
      'Documents',
      'ID Cards',
      'Books',
      'Bags',
      'Clothing',
      'Other'
    ];

    res.render('report', { title: 'Report Item', categories });
  } catch (error) {
    console.error('Report page error:', error.message);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Unable to open the report form.'
    });
  }
});

router.post('/report', isAuthenticated, async (req, res) => {
  const { name, category, type, location, date, description } = req.body;

  if (!name || !category || !type || !location || !date) {
    req.session.error = 'Please fill in all required fields.';
    return res.redirect('/report');
  }

  try {
    await Item.create({
      name: name.trim(),
      category: category.trim(),
      type,
      location: location.trim(),
      date,
      description: description ? description.trim() : '',
      reporter: req.session.userId,
      status: 'Open'
    });

    req.session.message = 'Item reported successfully.';
    return res.redirect('/items');
  } catch (error) {
    console.error('Report item error:', error.message);
    req.session.error = 'Unable to save the item. Please try again.';
    return res.redirect('/report');
  }
});

router.post('/my-reports/:id/delete', isAuthenticated, async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      reporter: req.session.userId
    });

    if (!item) {
      req.session.error = 'Report not found or you do not have permission to delete it.';
      return res.redirect('/my-reports');
    }

    try {
      await Claim.deleteMany({ item: item._id });
    } catch (error) {
      console.error('Delete report claims error:', error.message);
      req.session.error = 'The report was deleted, but its claims could not be removed.';
      return res.redirect('/my-reports');
    }

    req.session.message = 'Report deleted successfully.';
    return res.redirect('/my-reports');
  } catch (error) {
    console.error('Delete report error:', error.message);
    req.session.error = 'Unable to delete the report right now. Please try again.';
    return res.redirect('/my-reports');
  }
});

router.get('/my-reports', isAuthenticated, async (req, res) => {
  try {
    const items = await Item.find({ reporter: req.session.userId }).sort({ createdAt: -1 });
    res.render('my-reports', { title: 'My Reports', items });
  } catch (error) {
    console.error('My reports error:', error.message);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Unable to load your reports right now.'
    });
  }
});

module.exports = router;

const express = require('express');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.get('/claim/:id', isAuthenticated, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('reporter', 'name email roll');

    if (!item) {
      req.session.error = 'The requested item was not found.';
      return res.redirect('/items');
    }

    if (item.type !== 'Found') {
      req.session.error = 'Only found items can be claimed.';
      return res.redirect('/items');
    }

    if (item.reporter && item.reporter._id.toString() === req.session.userId) {
      req.session.error = 'You cannot claim your own item.';
      return res.redirect('/items');
    }

    const existingClaim = await Claim.findOne({
      item: item._id,
      student: req.session.userId
    });

    if (existingClaim) {
      req.session.error = 'You already submitted a claim for this item.';
      return res.redirect('/items');
    }

    return res.render('claim', { title: 'Claim Item', item });
  } catch (error) {
    console.error('Claim page error:', error.message);
    req.session.error = 'Unable to open the claim page.';
    return res.redirect('/items');
  }
});

router.post('/claim/:id', isAuthenticated, async (req, res) => {
  const { explanation } = req.body;

  if (!explanation || explanation.trim().length < 10) {
    req.session.error = 'Please provide a clear explanation of why the item belongs to you.';
    return res.redirect(`/claim/${req.params.id}`);
  }

  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      req.session.error = 'The item could not be found.';
      return res.redirect('/items');
    }

    if (item.type !== 'Found') {
      req.session.error = 'Only found items can be claimed.';
      return res.redirect('/items');
    }

    if (item.reporter.toString() === req.session.userId) {
      req.session.error = 'You cannot claim your own item.';
      return res.redirect('/items');
    }

    const existingClaim = await Claim.findOne({
      item: item._id,
      student: req.session.userId
    });

    if (existingClaim) {
      req.session.error = 'You already submitted a claim for this item.';
      return res.redirect('/items');
    }

    await Claim.create({
      item: item._id,
      student: req.session.userId,
      explanation: explanation.trim(),
      status: 'Pending'
    });

    item.status = 'Claim Pending';
    await item.save();

    req.session.message = 'Your claim has been submitted successfully.';
    return res.redirect('/my-claims');
  } catch (error) {
    console.error('Claim submission error:', error.message);
    req.session.error = 'Unable to submit the claim. Please try again.';
    return res.redirect(`/claim/${req.params.id}`);
  }
});

router.get('/my-claims', isAuthenticated, async (req, res) => {
  try {
    const claims = await Claim.find({ student: req.session.userId })
      .populate('item', 'name type location status createdAt')
      .sort({ createdAt: -1 });

    res.render('my-claims', { title: 'My Claims', claims });
  } catch (error) {
    console.error('My claims error:', error.message);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Unable to load your claims right now.'
    });
  }
});

module.exports = router;

const userModel = require('../models/userModel');
const petModel = require('../models/petModel');
const journalModel = require('../models/journalModel');

function dashboard(req, res) {
  res.render('adminDashboard', { session: req.session });
}

function listUsers(req, res) {
  userModel.findAll((err, results) => {
    if (err) return res.send('Error loading users');

    res.render('adminUsers', {
      users: results,
      session: req.session,
      messages: req.flash('success'),
      errors: req.flash('error')
    });
  });
}

function userDetails(req, res) {
  const userId = req.params.id;

  userModel.findById(userId, (err, userResults) => {
    if (err || userResults.length === 0) return res.send('User not found');

    petModel.findByOwner(userId, (err2, petResults) => {
      if (err2) return res.send('Error retrieving pet info');

      journalModel.findForAdminByOwner(userId, (err3, journalResults) => {
        if (err3) return res.send('Error retrieving journal entries');

        res.render('adminUserDetails', {
          user: userResults[0],
          pets: petResults,
          journals: journalResults,
          session: req.session
        });
      });
    });
  });
}

function deleteUser(req, res) {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId)) {
    req.flash('error', 'Invalid user.');
    return res.redirect('/admin/users');
  }

  // An admin must not delete their own account
  if (userId === req.session.user.id) {
    req.flash('error', 'You cannot delete your own account.');
    return res.redirect('/admin/users');
  }

  userModel.deleteById(userId, (err) => {
    if (err) {
      console.error('Error deleting user:', err);
      req.flash('error', 'Error deleting user.');
      return res.redirect('/admin/users');
    }
    req.flash('success', 'User deleted.');
    res.redirect('/admin/users');
  });
}

module.exports = { dashboard, listUsers, userDetails, deleteUser };

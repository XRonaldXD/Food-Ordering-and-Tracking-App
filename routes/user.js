const express = require('express');
const UserController = require('../controllers/userController');
const router = express.Router();


// GET /user                         
router.get('/', UserController.getusers);
// POST /user                        
router.post('/', UserController.createuser);
// GET /user/:id
router.get('/:id', UserController.getSpecuser);
// PUT /user/:id                     
router.put('/:id', UserController.updateuser);
// DELETE /user/:id                  
router.delete('/:id', UserController.deleteuser);

module.exports = router;
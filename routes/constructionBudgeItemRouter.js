const express = require('express');
const constructionBudgeItemRouter = express.Router();

constructionBudgeItemRouter.get('/:construction_id/budge/:budge_id/category/:category_id/item', (req, res) => {
    res.status(200).json({ msg : 'path test'});
});

module.exports = constructionBudgeItemRouter;
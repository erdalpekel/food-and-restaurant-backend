var express = require("express");
var router = express.Router();

const restaurantController = require("../controllers/restaurantProduct");

router.get("/", restaurantController.list);
router.get("/query", restaurantController.query);
router.get("/names", restaurantController.queryNames);

module.exports = router;

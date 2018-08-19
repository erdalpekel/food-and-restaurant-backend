const RestaurantProductModel = require("../models/restaurantProduct");

const list = function(req, res) {
	RestaurantProductModel.find()
		.exec()
		.then(restaurants => res.status(200).json(restaurants))
		.catch(error =>
			res.status(500).json({
				error: "Internal server error",
				message: error.message
			})
		);
};

const query = function(req, res) {
	console.log("query params:");
	console.log("name", req.query.name);
	console.log("priceStart", req.query.priceStart);
	console.log("priceEnd", req.query.priceEnd);
	console.log("long", req.query.longitude);
	console.log("lat", req.query.latitude);
	console.log("radius", req.query.radius);
	console.log("limit", req.query.limit);
	console.log("offset", req.query.offset);
	console.log("isOrganic", req.query.isOrganic);
	console.log("merchantTypes", req.query.merchantTypes);
	console.log("productCategory", req.query.productCategory);
	console.log("restaurantName", req.query.restaurantName);

	var aggregateOptions = [];
	var restaurantProductQuery = {};
	var restaurantGeoQuery = {};

	if (req.query.name) {
		restaurantProductQuery.name = RegExp(req.query.name, "i");
	}

	if (req.query.priceStart) {
		restaurantProductQuery.price = {};
		restaurantProductQuery.price["$gte"] = parseFloat(req.query.priceStart);
	}
	if (req.query.priceEnd) {
		if (!restaurantProductQuery.price) {
			restaurantProductQuery.price = {};
		}
		restaurantProductQuery.price["$lte"] = parseFloat(req.query.priceEnd);
	}

	if (req.query.isOrganic) {
		restaurantProductQuery.isOrganic = {
			$eq: req.query.isOrganic === "true"
		};
	}

	if (req.query.productCategory) {
		restaurantProductQuery.category = {
			$eq: req.query.productCategory
		};
	}

	if (req.query.latitude && req.query.longitude && req.query.radius) {
		const radiusInMeters = parseInt(req.query.radius) * 1000;
		console.log("radiusInMeters ", radiusInMeters);
		try {
			// MongoDB reads longitude first, then latitude
			const coordUser = [parseFloat(req.query.longitude), parseFloat(req.query.latitude)];
			console.log("coordUser: ", coordUser);

			restaurantGeoQuery = {
				maxDistance: radiusInMeters,
				near: {
					type: "Point",
					coordinates: coordUser
				},
				spherical: true,
				distanceField: "distance",
				limit: 99999
			};

			aggregateOptions.push({
				$geoNear: restaurantGeoQuery
			});
		} catch (e) {
			console.error(e);
		}
	}
	console.log("restaurantProductQuery: ", restaurantProductQuery);
	console.log("restaurantQuery: ", restaurantGeoQuery);

	var sortOptions = {};
	if (req.query.orderBy) {
		try {
			const orderSequence = req.query.orderSequence ? parseInt(req.query.orderSequence) : 1;
			sortOptions[req.query.orderBy] = orderSequence;
		} catch (e) {
			console.error(e);
		}
	} else {
		sortOptions["name"] = 1;
	}
	console.log("sortOpions: ", sortOptions);

	aggregateOptions.push({
		$match: restaurantProductQuery
	});
	aggregateOptions.push({
		$sort: sortOptions
	});

	const restaurantFieldsMatching = {};
	if (req.query.merchantTypes) {
		const merchantTypesArray = req.query.merchantTypes.split(",");
		if (
			merchantTypesArray !== "undefined" &&
			merchantTypesArray.length > 0
		) {
			console.log("merchantTypesArray: ", merchantTypesArray);
			restaurantFieldsMatching["restaurant.category"] = {
				$in: merchantTypesArray
			};
		}
	}

	if (req.query.restaurantName) {
		restaurantFieldsMatching["restaurant.name"] = RegExp(req.query.restaurantName, "i");
	}

	aggregateOptions.push({
		$match: restaurantFieldsMatching
	});

	// we need the total result count for pagiantion. For that we need to set an aggregate option
	aggregateOptions.push({
		$group: {
			_id: null,
			total: {
				$sum: 1
			},
			results: {
				$push: "$$ROOT"
			}
		}
	});

	// the slice array hast three parameters, of which the second is the offset and the third the limit
	// https://docs.mongodb.com/manual/reference/operator/aggregation/slice/
	const sliceArray = ["$results"];
	// set pagination parameters if requested
	// they need to be converted to INT gently before, otherwise the aggregate function breaks
	if (req.query.offset) {
		try {
			const offset = parseInt(req.query.offset);
			console.log("offset: ", offset);
			if (offset) {
				sliceArray.push(offset);
			}
		} catch (e) {
			console.error(e);
		}
	}
	if (req.query.limit) {
		try {
			const limit = parseInt(req.query.limit);
			console.log("limit: ", limit);
			if (limit) {
				sliceArray.push(limit);
			}
		} catch (e) {
			console.error(e);
		}
	}

	aggregateOptions.push({
		$project: {
			total: 1,
			results: {
				$slice: sliceArray
			}
		}
	});

	RestaurantProductModel.aggregate(aggregateOptions)
		.exec()
		.then(restaurants => {
			res.status(200).json(restaurants);
		})
		.catch(error =>
			res.status(500).json({
				error: "Internal server error",
				message: error.message
			})
		);
};

const queryNames = function(req, res) {
	console.log("long", req.query.longitude);
	console.log("lat", req.query.latitude);
	console.log("radius", req.query.radius);

	const query = {};
	if (req.query.latitude && req.query.longitude && req.query.radius) {
		const radiusInMeters = parseInt(req.query.radius) * 1000;
		console.log("radiusInMeters ", radiusInMeters);
		try {
			// MongoDB reads longitude first, then latitude
			const coordUser = [parseFloat(req.query.longitude), parseFloat(req.query.latitude)];
			console.log("coordUser: ", coordUser);

			query.location = {
				$near: {
					type: "Point",
					coordinates: coordUser
				},
				$maxDistance: radiusInMeters
			};
		} catch (e) {
			console.error(e);

			return res.status(500).json({
				error: "Internal Server Error",
				message: "Error occured when parsing input"
			});
		}
	}

	RestaurantProductModel.find(query, "_id, restaurant.name")
		.exec()
		.then(restaurants => res.status(200).json(restaurants))
		.catch(error =>
			res.status(500).json({
				error: "Internal server error",
				message: error.message
			})
		);
};

module.exports = {
	list,
	query,
	queryNames
};

const mongoose = require("mongoose");

const RestaurantProductSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	location: {
		type: {
			type: String
		},
		coordinates: []
	},
	image: {
	    type: String
	},
	description: {
		type: String
	},
	isOrganic: {
		type: Boolean,
		required: true
	},
	price: {
		type: Number,
		required: true
	},
	category: {
		type: String,
		enum: ["Pasta", "Salad", "Bread", "Soup", "Antipasti", "Roast"],
		default: "Bread",
		required: true
	},
	restaurant: {
		name: {
			type: String,
			required: true
		},
		category: {
			type: String,
			enum: ["Ethnic", "FastFood", "Casual"],
			default: "FastFood",
			required: true
		},
		website: {
			type: String
		},
		address: {
			type: String
		},
		description: {
			type: String
		},
		email: {
			type: String
		},
		phone: {
			type: String
		},
	}
});

RestaurantProductSchema.set("versionKey", false);
RestaurantProductSchema.set("timestamps", true);

RestaurantProductSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Restaurant", RestaurantProductSchema);

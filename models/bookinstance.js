const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema(
	{
		book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
		imprint: { type: String, required: true },
		status: {
			type: String,
			required: true,
			enum: ["Available", "Maintenance", "Loaned", "Reserved"],
			default: "Maintenance",
		},
		due_back: { type: Date, default: Date.now() },
	},
	{
		virtuals: {
			url: {
				get() {
					return `/catalog/bookinstance/${this._id}`;
				},
			},
			due_back_formatted: {
				get() {
					return DateTime.fromJSDate(this.due_back).toLocaleString(
						DateTime.DATETIME_MED
					);
				},
			},
			due_back_yyyy_mm_dd: {
				get() {
					return DateTime.fromJSDate(this.due_back).toISODate();
				},
			},
		},
	}
);

module.exports = mongoose.model("BookInstance", BookInstanceSchema);

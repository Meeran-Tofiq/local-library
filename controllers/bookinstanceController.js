const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
	const allBookInstances = await BookInstance.find({})
		.populate("book")
		.exec();

	res.render("bookinstance_list", {
		title: "Book Copies",
		all_book_instances: allBookInstances,
	});
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
	const bookInstance = await BookInstance.findById(req.params.id)
		.populate("book")
		.exec();

	if (bookInstance === null) {
		const err = new Error("Book Instance not found");
		err.status = 404;
		return next(err);
	}

	res.render("bookinstance_detail", {
		title: "Book Instance Detail",
		bookinstance: bookInstance,
	});
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
	const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

	res.render("bookinstance_form", {
		title: "Create Book Instance",
		book_list: allBooks,
	});
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
	body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
	body("imprint", "Imprint must be specified")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("status").escape(),
	body("due_back", "Invalid date")
		.optional({ values: "falsy" })
		.isISO8601()
		.toDate(),
	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);
		const bookInstance = new BookInstance({
			book: req.body.book,
			imprint: req.body.imprint,
			status: req.body.status,
			due_back: req.body.due_back,
		});

		if (!errors.isEmpty()) {
			const allBooks = await Book.find({}, "title")
				.sort({ title: 1 })
				.exec();

			res.render("bookinstance_form", {
				title: "Create Book Instance",
				book_list: allBooks,
				selected_book: bookInstance.book._id,
				errors: errors.array(),
				bookinstance: bookInstance,
			});
			return;
		}

		await bookInstance.save();
		res.redirect(bookInstance.url);
	}),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
	const bookinstance = await BookInstance.findById(req.params.id).exec();

	if (!bookinstance) {
		res.redirect("/catalog/bookinstances");
		return;
	}

	res.render("bookinstance_delete", {
		title: "Delete Copy",
		bookinstance,
	});
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
	await BookInstance.findByIdAndDelete(req.body.bookinstance_id);
	res.redirect("/catalog/bookinstances");
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
	const [bookinstance, book_list] = await Promise.all([
		BookInstance.findById(req.params.id).exec(),
		Book.find({}, "title").exec(),
	]);

	if (!bookinstance) {
		const err = new Error("Book Copy not found");
		err.status = 404;
		next(err);
	}

	res.render("bookinstance_form", {
		title: "Update Book Copy",
		bookinstance,
		book_list,
		selected_book: bookinstance.book._id,
	});
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
	body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
	body("imprint", "Imprint must be specified")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("status").escape(),
	body("due_back", "Invalid date")
		.optional({ values: "falsy" })
		.isISO8601()
		.toDate(),

	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);

		const bookinstance = new BookInstance({
			_id: req.params.id,
			book: req.body.book,
			imprint: req.body.imprint,
			status: req.body.status,
			due_back: req.body.due_back,
		});

		if (!errors.isEmpty()) {
			const book_list = await Book.find({}, "title").exec();

			res.render("bookinstance_form", {
				title: "Update Book Copy",
				bookinstance,
				book_list,
				errors: errors.array(),
				selected_book: bookinstance.book._id,
			});
			return;
		}

		const updatedBookinstance = await BookInstance.findByIdAndUpdate(
			req.params.id,
			bookinstance,
			{}
		);
		res.redirect(updatedBookinstance.url);
	}),
];

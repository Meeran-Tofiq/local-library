const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.index = asyncHandler(async (req, res, next) => {
	const [
		numBooks,
		numBookInstances,
		numAvailableBookInstances,
		numAuthors,
		numGenres,
	] = await Promise.all([
		Book.countDocuments({}).exec(),
		BookInstance.countDocuments({}).exec(),
		BookInstance.countDocuments({ status: "Available" }).exec(),
		Author.countDocuments({}).exec(),
		Genre.countDocuments({}).exec(),
	]);

	res.render("index", {
		title: "Homepage",
		book_count: numBooks,
		book_instance_count: numBookInstances,
		book_instance_available_count: numAvailableBookInstances,
		author_count: numAuthors,
		genre_count: numGenres,
	});
});

// Display list of all books.
exports.book_list = asyncHandler(async (req, res, next) => {
	const allBooks = await Book.find({}, "title author")
		.sort({ title: 1 })
		.populate("author")
		.exec();

	res.render("book_list", {
		title: "Books List",
		book_list: allBooks,
	});
});

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
	const [book, bookInsances] = await Promise.all([
		Book.findById(req.params.id)
			.populate("author")
			.populate("genre")
			.exec(),
		BookInstance.find({ book: req.params.id }).exec(),
	]);

	if (book === null) {
		const err = new Error("Book not found");
		err.status = 404;
		return next(err);
	}

	res.render("book_detail", {
		title: "Book Details",
		book,
		book_instances: bookInsances,
	});
});

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
	const [allAuthors, allGenres] = await Promise.all([
		Author.find().sort({ family_name: 1 }).exec(),
		Genre.find().sort({ name: 1 }).exec(),
	]);

	res.render("book_form", {
		title: "Create Book",
		authors: allAuthors,
		genres: allGenres,
	});
});

// Handle book create on POST.
exports.book_create_post = [
	(req, res, next) => {
		if (!Array.isArray(req.body.genre)) {
			req.body.genre =
				typeof req.body.genre === "undefined" ? [] : [req.body.genre];
		}
		next();
	},
	body("title", "Title must not be empty.")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("author", "Author must not be empty.")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("summary", "Summary must not be empty.")
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
	body("genre.*").escape(),
	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);
		const book = new Book({
			title: req.body.title,
			summary: req.body.summary,
			author: req.body.author,
			genre: req.body.genre,
			isbn: req.body.isbn,
		});

		if (!errors.isEmpty()) {
			const [allAuthors, allGenres] = await Promise.all([
				Author.find().sort({ family_name: 1 }).exec(),
				Genre.find().sort({ name: 1 }).exec(),
			]);

			for (const genre of allGenres) {
				if (book.genre.includes(genre._id)) {
					genre.checked = "true";
				}
			}
			res.render("book_form", {
				title: "Create Book",
				authors: allAuthors,
				genres: allGenres,
				book: book,
				errors: errors.array(),
			});
			return;
		}

		await book.save();
		res.redirect(book.url);
	}),
];

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
	const [book, allBookInstances] = await Promise.all([
		Book.findById(req.params.id).exec(),
		BookInstance.find({ book: req.params.id }).exec(),
	]);

	if (!book) {
		res.redirect("/catalog/books");
		return;
	}

	res.render("book_delete", {
		title: "Delete Book",
		book,
		bookinstance_list: allBookInstances,
	});
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
	const [book, allBookInstances] = await Promise.all([
		Book.findById(req.params.id).exec(),
		BookInstance.find({ book: req.params.id }).exec(),
	]);

	if (allBookInstances.length > 0) {
		res.render("book_delete", {
			title: "Delete Book",
			book,
			bookinstance_list: allBookInstances,
		});
		return;
	}

	await Book.findByIdAndDelete(req.body.bookid);
	res.redirect("/catalog/books");
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
	res.send("NOT IMPLEMENTED: Book update GET");
});

// Handle book update on POST.
exports.book_update_post = asyncHandler(async (req, res, next) => {
	res.send("NOT IMPLEMENTED: Book update POST");
});

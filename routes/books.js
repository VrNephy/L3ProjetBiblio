const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');

// All Books Route
router.get('/', async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'));
  }
  try {
    const books = await query.exec();
    res.render('books/index', {
      books: books,
      searchOptions: req.query,
    });
  } catch {
    res.redirect('/');
  }
});

// New Book Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book());
});

// Create Book Route
router.post('/', async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
  });

  try {
    const newBook = await book.save();
    res.redirect(`books/${newBook.id}`);
  } catch {
    renderNewPage(res, book, true);
  }
});

// Show Book Route
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author').exec();
    res.render('books/show', { book: book });
  } catch {
    res.redirect('/');
  }
});

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch {
    res.redirect('/');
  }
});

// Update Book Route
router.put(
  '/:id',
  [
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  ],
  async (req, res) => {
    let book;

    try {
      book = await Book.findById(req.params.id);
      book.title = req.body.title;
      book.author = req.body.author;
      book.summary = req.body.summary;
      book.isbn = req.body.isbn;

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        renderEditPage(res, book, true, errors.array());
        return;
      }

      await book.save();
      res.redirect(`/books/${book.id}`);
    } catch (error) {
      console.error(error);
      if (book != null) {
        renderEditPage(res, book, true);
      } else {
        res.redirect('/');
      }
    }
  }
);

// Delete Book Page
router.delete('/:id', async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.remove();
    res.redirect('/books');
  } catch {
    if (book != null) {
      res.render('books/show', {
        book: book,
        errorMessage: 'Could not remove book',
      });
    } else {
      res.redirect('/');
    }
  }
});

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, 'new', hasError);
}

async function renderEditPage(res, book, hasError = false, errors = []) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
      errors: errors,
    };
    if (hasError) {
      params.errorMessage = 'Error Updating Book';
    }
    res.render('books/edit', params);
  } catch {
    res.redirect('/books');
  }
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Book';
      } else {
        params.errorMessage = 'Error Creating Book';
      }
    }
    res.render(`books/${form}`, params);
  } catch {
    res.redirect('/books');
  }
}

module.exports = router;

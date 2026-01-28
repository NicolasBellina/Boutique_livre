// Validateurs pour les données
export function validateISBN(isbn) {
  // Format ISBN-13 simple: 13 chiffres
  if (!isbn || !/^\d{13}$/.test(isbn)) {
    throw new Error('ISBN must be 13 digits');
  }
  return true;
}

export function validateBook(book) {
  const errors = {};

  if (!book.title || book.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (book.title.length > 255) {
    errors.title = 'Title must be less than 255 characters';
  }

  if (!book.author || book.author.trim().length === 0) {
    errors.author = 'Author is required';
  } else if (book.author.length > 255) {
    errors.author = 'Author must be less than 255 characters';
  }

  if (book.year && (book.year < 1000 || book.year > 2099)) {
    errors.year = 'Year must be between 1000 and 2099';
  }

  if (!book.isbn) {
    errors.isbn = 'ISBN is required';
  } else {
    try {
      validateISBN(book.isbn);
    } catch (e) {
      errors.isbn = e.message;
    }
  }

  if (!book.price || book.price <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  if (book.quantity && book.quantity < 0) {
    errors.quantity = 'Quantity cannot be negative';
  }

  if (Object.keys(errors).length > 0) {
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.details = errors;
    throw err;
  }

  return true;
}

export function validateOrder(order) {
  const errors = {};

  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    errors.items = 'At least one item is required';
  } else {
    order.items.forEach((item, index) => {
      if (!item.bookId || item.bookId <= 0) {
        errors[`items[${index}].bookId`] = 'Valid bookId is required';
      }
      if (!item.quantity || item.quantity <= 0) {
        errors[`items[${index}].quantity`] = 'Quantity must be greater than 0';
      }
    });
  }

  if (order.customerEmail && !isValidEmail(order.customerEmail)) {
    errors.customerEmail = 'Invalid email format';
  }

  if (Object.keys(errors).length > 0) {
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.details = errors;
    throw err;
  }

  return true;
}

export function validateEvent(event) {
  const errors = {};

  if (!event.name || event.name.trim().length === 0) {
    errors.name = 'Event name is required';
  } else if (event.name.length > 255) {
    errors.name = 'Event name must be less than 255 characters';
  }

  if (!event.date) {
    errors.date = 'Date is required';
  } else {
    const eventDate = new Date(event.date);
    if (isNaN(eventDate.getTime())) {
      errors.date = 'Invalid date format';
    }
  }

  if (event.description && event.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  if (event.capacity && event.capacity <= 0) {
    errors.capacity = 'Capacity must be greater than 0';
  }

  if (Object.keys(errors).length > 0) {
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.details = errors;
    throw err;
  }

  return true;
}

// Utilitaire: valider format email simple
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utilitaire: générer numéro de commande unique
export function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
}

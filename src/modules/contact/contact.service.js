import { ContactModel } from './contact.model.js';

function assertNonEmpty(value, field) {
  if (value === undefined || value === null || String(value).trim() === '') {
    const err = new Error(`${field} is required`);
    err.name = 'ValidationError';
    err.status = 400;
    throw err;
  }
}

export const ContactService = {
  async createContact({ name, email, message }) {
    assertNonEmpty(name, 'Name');
    assertNonEmpty(email, 'Email');
    assertNonEmpty(message, 'Message');

    return ContactModel.create({
      name: String(name).trim(),
      email: String(email).trim(),
      message: String(message).trim(),
    });
  },
};


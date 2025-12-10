import { successResponse } from '../../utils/response.util.js';
import { ContactService } from './contact.service.js';

export const ContactController = {
  async create(req, res, next) {
    try {
      const { name, email, message } = req.body;
      const contact = await ContactService.createContact({ name, email, message });
      return successResponse(res, 'Contact submitted', { contact }, 201);
    } catch (err) {
      return next(err);
    }
  },
};


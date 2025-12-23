import { verifyToken } from '../utils/jwt.util.js';
import { prisma } from '../config/db.js';
import { MESSAGES } from '../config/messages.js';
import { errorResponse } from '../utils/response.util.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return errorResponse(res, MESSAGES.UNAUTHORIZED, 'AuthError', 401);
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return errorResponse(res, MESSAGES.UNAUTHORIZED, 'AuthError', 401);
    }

    req.user = { id: user.id, name: `${user.firstName} ${user.lastName}`.trim(), email: user.email };
    return next();
  } catch (err) {
    return errorResponse(res, MESSAGES.UNAUTHORIZED, 'AuthError', 401);
  }
}

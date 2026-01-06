const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../models/User');

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should return 401 if no token is provided', async () => {
      req.header.mockReturnValue(null);

      await auth.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'No authentication token provided'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      req.header.mockReturnValue('Bearer invalidtoken');
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => { throw error; });

      await auth.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is expired', async () => {
      req.header.mockReturnValue('Bearer expiredtoken');
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => { throw error; });

      await auth.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token expired'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user not found', async () => {
      req.header.mockReturnValue('Bearer validtoken');
      jwt.verify.mockReturnValue({ id: 'userid' });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await auth.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next and attach user to req if token is valid', async () => {
      const user = { id: 'userid', name: 'Test User' };
      req.header.mockReturnValue('Bearer validtoken');
      jwt.verify.mockReturnValue({ id: 'userid' });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(user)
      });

      await auth.authenticate(req, res, next);

      expect(req.user).toEqual(user);
      expect(req.token).toBe('validtoken');
      expect(next).toHaveBeenCalled();
    });

    it('should return 500 on server error', async () => {
      req.header.mockReturnValue('Bearer validtoken');
      jwt.verify.mockReturnValue({ id: 'userid' });
      User.findById.mockImplementation(() => { throw new Error('DB Error'); });

      await auth.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication failed',
        message: 'DB Error'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should proceed without user if no token provided', async () => {
      req.header.mockReturnValue(null);

      await auth.optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should proceed without user if token invalid', async () => {
      req.header.mockReturnValue('Bearer invalidtoken');
      jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

      await auth.optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('should attach user if token valid', async () => {
      const user = { id: 'userid', name: 'Test User' };
      req.header.mockReturnValue('Bearer validtoken');
      jwt.verify.mockReturnValue({ id: 'userid' });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(user)
      });

      await auth.optionalAuth(req, res, next);

      expect(req.user).toEqual(user);
      expect(req.token).toBe('validtoken');
      expect(next).toHaveBeenCalled();
    });

    it('should proceed without user if user not found', async () => {
      req.header.mockReturnValue('Bearer validtoken');
      jwt.verify.mockReturnValue({ id: 'userid' });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await auth.optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('isAdmin', () => {
    it('should return 401 if user not authenticated', () => {
      req.user = undefined;

      auth.isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not admin', () => {
      req.user = { isAdmin: false };

      auth.isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Admin access required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user is admin', () => {
      req.user = { isAdmin: true };

      auth.isAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('isVerified', () => {
    it('should return 401 if user not authenticated', () => {
      req.user = undefined;

      auth.isVerified(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not verified', () => {
      req.user = { isVerified: false };

      auth.isVerified(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email verification required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user is verified', () => {
      req.user = { isVerified: true };

      auth.isVerified(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});

const authController = require('../../controllers/authController');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

jest.mock('../../models/User');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('express-validator');

describe('Auth Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      user: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();

    // Default validation result mock (no errors)
    validationResult.mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([])
    });
  });

  describe('register', () => {
    it('should return 400 if validation fails', async () => {
      const errors = [{ msg: 'Invalid email' }];
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(errors)
      });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: errors
      });
    });

    it('should return 400 if user already exists', async () => {
      req.body = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };
      User.findOne.mockResolvedValue({ id: 'existinguser' });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User already exists with this email or username'
      });
    });

    it('should create new user and return token on success', async () => {
      req.body = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedpassword');

      const mockUserSave = jest.fn();
      const mockUser = {
        id: 'newuserid',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        preferences: {},
        progress: {},
        save: mockUserSave
      };
      User.mockImplementation(() => mockUser);

      jwt.sign.mockReturnValue('newtoken');

      await authController.register(req, res);

      expect(User.findOne).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(mockUserSave).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        token: 'newtoken',
        user: expect.objectContaining({
          id: 'newuserid',
          email: 'test@example.com'
        })
      }));
    });

    it('should return 500 on server error', async () => {
        User.findOne.mockRejectedValue(new Error('DB Error'));

        await authController.register(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Server error during registration'
        });
    });
  });

  describe('login', () => {
    it('should return 400 if validation fails', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(false),
            array: jest.fn().mockReturnValue([{ msg: 'Error' }])
        });

        await authController.login(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if user not found', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('should return 400 if password does not match', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const mockUser = { password: 'hashedpassword' };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('should return token on successful login', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        id: 'userid',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        save: jest.fn(),
        preferences: {},
        progress: {},
        achievements: [],
        lastLogin: null
      };
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');

      await authController.login(req, res);

      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        token: 'token'
      }));
    });

    it('should return 500 on server error', async () => {
        req.body = { email: 'test@example.com', password: 'password' };
        User.findOne.mockImplementation(() => { throw new Error('DB Error'); });

        await authController.login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('refreshToken', () => {
    it('should return 404 if user not found', async () => {
      req.user = { id: 'userid' };
      User.findById.mockResolvedValue(null);

      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('should return new token if user found', async () => {
      req.user = { id: 'userid' };
      const mockUser = {
        id: 'userid',
        email: 'test@example.com',
        username: 'testuser'
      };
      User.findById.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('newtoken');

      await authController.refreshToken(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        token: 'newtoken'
      }));
    });

    it('should return 500 on server error', async () => {
        req.user = { id: 'userid' };
        User.findById.mockRejectedValue(new Error('DB Error'));

        await authController.refreshToken(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      await authController.logout(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful'
      });
    });

    // Simulate error (though unlikely in current implementation)
    it('should return 500 on error', async () => {
         // Create a spy on res.json to throw an error, mimicking a failure inside the function logic
         // But since the function is simple, we might need to change implementation to test error handling effectively
         // Or rely on the fact that if res.json throws it will be caught? No, res.json is called at the end.
         // Let's assume we can't easily force an error without modifying the controller code or mocking something it uses.
         // The controller doesn't use any external service that we can mock to fail easily here except res.json itself.

         const error = new Error('Logout failed');
         res.json.mockImplementationOnce(() => { throw error; });

         await authController.logout(req, res);

         expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('forgotPassword', () => {
      it('should return 400 on validation error', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(false),
            array: jest.fn().mockReturnValue([{ msg: 'Error' }])
        });

        await authController.forgotPassword(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should return success message even if user not found (security)', async () => {
          req.body = { email: 'notfound@example.com' };
          User.findOne.mockResolvedValue(null);

          await authController.forgotPassword(req, res);

          expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
              success: true,
              message: 'If an account with that email exists, a password reset link has been sent'
          }));
      });

      it('should generate reset token if user found', async () => {
          req.body = { email: 'found@example.com' };
          const mockUser = { id: 'userid' };
          User.findOne.mockResolvedValue(mockUser);
          jwt.sign.mockReturnValue('resettoken');

          await authController.forgotPassword(req, res);

          expect(jwt.sign).toHaveBeenCalled();
          expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
              success: true
          }));
      });

      it('should return 500 on server error', async () => {
          req.body = { email: 'test@example.com' };
          User.findOne.mockRejectedValue(new Error('DB Error'));

          await authController.forgotPassword(req, res);

          expect(res.status).toHaveBeenCalledWith(500);
      });
  });

  describe('resetPassword', () => {
      it('should return 400 on validation error', async () => {
        validationResult.mockReturnValue({
            isEmpty: jest.fn().mockReturnValue(false),
            array: jest.fn().mockReturnValue([{ msg: 'Error' }])
        });
        await authController.resetPassword(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should return 400 if token is invalid', async () => {
          req.body = { token: 'invalid', password: 'newpassword' };
          jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

          await authController.resetPassword(req, res);

          expect(res.status).toHaveBeenCalledWith(400);
          expect(res.json).toHaveBeenCalledWith({
              success: false,
              message: 'Invalid or expired reset token'
          });
      });

      it('should return 400 if token type is incorrect', async () => {
          req.body = { token: 'valid', password: 'newpassword' };
          jwt.verify.mockReturnValue({ type: 'not_password_reset' });

          await authController.resetPassword(req, res);

          expect(res.status).toHaveBeenCalledWith(400);
          expect(res.json).toHaveBeenCalledWith({
              success: false,
              message: 'Invalid reset token'
          });
      });

      it('should return 400 if user not found', async () => {
          req.body = { token: 'valid', password: 'newpassword' };
          jwt.verify.mockReturnValue({ userId: 'userid', type: 'password_reset' });
          User.findById.mockResolvedValue(null);

          await authController.resetPassword(req, res);

          expect(res.status).toHaveBeenCalledWith(400);
          expect(res.json).toHaveBeenCalledWith({
              success: false,
              message: 'User not found'
          });
      });

      it('should reset password on success', async () => {
          req.body = { token: 'valid', password: 'newpassword' };
          jwt.verify.mockReturnValue({ userId: 'userid', type: 'password_reset' });
          const mockUser = {
              save: jest.fn()
          };
          User.findById.mockResolvedValue(mockUser);
          bcrypt.genSalt.mockResolvedValue('salt');
          bcrypt.hash.mockResolvedValue('hashednewpassword');

          await authController.resetPassword(req, res);

          expect(mockUser.password).toBe('hashednewpassword');
          expect(mockUser.save).toHaveBeenCalled();
          expect(res.json).toHaveBeenCalledWith({
              success: true,
              message: 'Password reset successful'
          });
      });

      it('should return 500 on server error', async () => {
          req.body = { token: 'valid', password: 'pass' };
          jwt.verify.mockImplementation(() => { throw new Error('Unexpected Error'); }); // Should be caught by verify try/catch block if it was jwt error? No, unexpected errors go to outer catch.
          // Wait, the code has a try/catch specifically for jwt.verify.
          // To trigger the outer catch (500), we need User.findById or save to fail.
          jwt.verify.mockReturnValue({ userId: 'userid', type: 'password_reset' });
          User.findById.mockRejectedValue(new Error('DB Error'));

          await authController.resetPassword(req, res);

          expect(res.status).toHaveBeenCalledWith(500);
      });
  });

  describe('getMe', () => {
      it('should return 404 if user not found', async () => {
          req.user = { id: 'userid' };
          User.findById.mockReturnValue({
              populate: jest.fn().mockReturnThis(),
              select: jest.fn().mockResolvedValue(null)
          });

          await authController.getMe(req, res);

          expect(res.status).toHaveBeenCalledWith(404);
          expect(res.json).toHaveBeenCalledWith({
              success: false,
              message: 'User not found'
          });
      });

      it('should return user info on success', async () => {
          req.user = { id: 'userid' };
          const mockUser = {
              id: 'userid',
              email: 'test@example.com',
              username: 'testuser'
          };
          User.findById.mockReturnValue({
              populate: jest.fn().mockReturnThis(),
              select: jest.fn().mockResolvedValue(mockUser)
          });

          await authController.getMe(req, res);

          expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
              success: true,
              user: expect.objectContaining({
                  id: 'userid'
              })
          }));
      });

      it('should return 500 on server error', async () => {
          req.user = { id: 'userid' };
          User.findById.mockImplementation(() => { throw new Error('DB Error'); });

          await authController.getMe(req, res);

          expect(res.status).toHaveBeenCalledWith(500);
      });
  });
});

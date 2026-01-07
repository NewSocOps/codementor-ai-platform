# Task: Implement Stripe Payment Integration

**ID:** TASK-001
**Assigned to:** Jules
**Status:** TODO
**Priority:** High
**Created:** 2026-01-07
**Due:** 2026-01-09

## Description

Implement Stripe payment integration for subscription billing on the CodeMentor AI platform. This enables monetization through paid subscription tiers.

### Scope
- Backend Stripe API integration
- Subscription management endpoints
- Webhook handling for payment events
- Secure payment processing
- Test coverage for all payment flows

### Business Context
- Enables Starter tier ($19/month) and Pro tier ($49/month)
- Required for Q1 2026 revenue goal: $500 MRR
- Critical path item for product launch

## Acceptance Criteria

- [ ] Stripe API configured with environment variables (test keys)
- [ ] Backend endpoint: `POST /api/payments/create-checkout-session`
- [ ] Backend endpoint: `POST /api/payments/webhook` (handles Stripe events)
- [ ] Backend endpoint: `GET /api/payments/subscription-status`
- [ ] Backend endpoint: `POST /api/payments/cancel-subscription`
- [ ] Subscription data stored in MongoDB User model
- [ ] Webhook signature verification implemented
- [ ] Error handling for failed payments
- [ ] Unit tests with >70% coverage
- [ ] Integration tests for key flows
- [ ] API documentation updated

## Technical Details

### Architecture

```
Frontend (Next.js)
    ↓
Backend API (Express)
    ↓
Stripe API
    ↓
Webhooks → Backend → MongoDB
```

### Implementation Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install stripe
   ```

2. **Environment Variables** (add to `.env.example`)
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_ID_STARTER_MONTHLY=price_starter_monthly
   STRIPE_PRICE_ID_PRO_MONTHLY=price_pro_monthly
   ```

3. **Update User Model** (`backend/models/User.js`)
   Add fields:
   ```javascript
   subscription: {
     status: { type: String, enum: ['none', 'active', 'canceled', 'past_due'], default: 'none' },
     tier: { type: String, enum: ['free', 'starter', 'pro', 'teams'], default: 'free' },
     stripeCustomerId: String,
     stripeSubscriptionId: String,
     currentPeriodEnd: Date
   }
   ```

4. **Create Payment Controller** (`backend/controllers/paymentController.js`)
   - `createCheckoutSession()` - Create Stripe checkout
   - `handleWebhook()` - Process Stripe webhooks
   - `getSubscriptionStatus()` - Get user's subscription info
   - `cancelSubscription()` - Cancel user's subscription

5. **Create Payment Routes** (`backend/routes/payments.js`)
   ```javascript
   router.post('/create-checkout-session', authenticate, createCheckoutSession);
   router.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);
   router.get('/subscription-status', authenticate, getSubscriptionStatus);
   router.post('/cancel-subscription', authenticate, cancelSubscription);
   ```

6. **Webhook Events to Handle**
   - `checkout.session.completed` - Subscription created
   - `customer.subscription.updated` - Subscription changed
   - `customer.subscription.deleted` - Subscription canceled
   - `invoice.payment_failed` - Payment failed

### Security Requirements

- ✅ Never expose secret keys in frontend
- ✅ Verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Validate all user input
- ✅ Implement rate limiting on payment endpoints
- ✅ Log all payment events for audit

### Testing Strategy

**Unit Tests** (`backend/tests/controllers/paymentController.test.js`):
- Mock Stripe API calls
- Test each controller function
- Test error scenarios
- Test webhook event processing

**Integration Tests** (`backend/tests/integration/payments.test.js`):
- Use Stripe test mode
- Test complete checkout flow
- Test webhook delivery
- Test subscription lifecycle

### Reference Documentation
- <a href="https://stripe.com/docs/api?lang=node">Stripe Node.js SDK</a>
- <a href="https://stripe.com/docs/payments/checkout">Stripe Checkout</a>
- <a href="https://stripe.com/docs/webhooks">Stripe Webhooks</a>
- <a href="https://stripe.com/docs/testing">Stripe Testing</a>

## Dependencies

- **Requires:** None (can start immediately)
- **Blocks:** TASK-002 (Frontend payment UI)

## Testing Requirements

- **Unit tests:** Yes - >70% coverage required
- **Integration tests:** Yes - test checkout and webhook flows
- **Manual testing:** Use Stripe test cards before production

### Test Cards (Stripe Test Mode)
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

## Related Files

- `backend/models/User.js` - Add subscription fields
- `backend/controllers/paymentController.js` - Create new
- `backend/routes/payments.js` - Create new
- `backend/tests/controllers/paymentController.test.js` - Create new
- `backend/tests/integration/payments.test.js` - Create new
- `.env.example` - Add Stripe keys
- `docs/api/openapi.yaml` - Document payment endpoints

## Status Updates

- 2026-01-07 14:30: Task created by Claude
- [Jules, add your updates here as you progress]

---

## 💡 Notes for Jules

- Use existing auth middleware pattern (see `backend/middleware/auth.js`)
- Follow controller pattern from `backend/controllers/authController.js`
- Check `AGENTS.md` for code style and testing guidelines
- Ask questions in `/docs/agent-inbox/claude-inbox.md` if blocked
- This is critical path - prioritize over other tasks!

Good luck, Jules! We're counting on you. 💪

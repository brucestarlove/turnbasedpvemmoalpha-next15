# AI Development Guide - Next.js 15 Starter Template

## 🎯 Project Overview

This is a **production-ready Next.js 15 starter template** with a comprehensive tech stack designed for building modern web applications. It includes authentication, payments, internationalization, testing, and database integration out of the box.

## 🏗️ Architecture & File Structure

### Core Application Structure
```
src/
├── app/                          # Next.js App Router (RSC-first)
│   ├── [locale]/                 # Internationalized routes
│   │   ├── layout.tsx           # Root layout with providers
│   │   └── page.tsx             # Homepage with auth & Stripe
│   ├── api/                     # API routes
│   │   ├── auth/[...nextauth]/  # NextAuth.js authentication
│   │   └── stripe/webhook/      # Stripe webhook handler
│   ├── robots.ts                # SEO robots.txt
│   └── sitemap.ts              # Dynamic sitemap generation
├── components/                   # Reusable UI components
│   ├── ui/                      # Shadcn/ui components
│   │   └── button.tsx          # Base button component
│   ├── auth-controls.tsx        # Authentication UI
│   ├── stripe-button.tsx        # Payment integration
│   ├── theme-switcher.tsx       # Dark/light mode toggle
│   └── lang-switcher.tsx        # Language switcher
├── lib/                         # Core utilities & configurations
│   ├── auth.ts                  # NextAuth.js configuration
│   ├── schema.ts                # Drizzle ORM schema
│   ├── stripe.ts                # Stripe server configuration
│   ├── utils.ts                 # Utility functions
│   └── env.mjs                  # Environment validation
├── actions/                     # Server Actions
│   └── create-checkout-session.ts # Stripe checkout
└── styles/                      # Global styles
    └── globals.css              # Tailwind CSS imports
```

### Database & Configuration
```
├── drizzle/                     # Database migrations
│   ├── 0000_tearful_wendell_rand.sql
│   ├── 0001_small_sabra.sql
│   └── meta/                    # Migration metadata
├── drizzle.config.ts            # Drizzle ORM configuration
├── messages/                    # i18n translation files
│   ├── en.json                  # English translations
│   └── es.json                  # Spanish translations
└── middleware.ts                # Next.js middleware
```

### Testing & Quality
```
├── __tests__/                   # Test files
│   ├── e2e/                     # End-to-end tests
│   │   └── home.spec.ts         # Playwright tests
│   └── unit/                    # Unit tests
│       └── theme-switcher.spec.tsx # Jest tests
├── jest.config.js               # Jest configuration
├── jest.setup.js                # Jest setup
├── playwright.config.ts         # Playwright configuration
└── .eslintrc.json               # ESLint configuration
```

## 🚀 Application Types You Can Build

### 1. **SaaS Platform** 🏢
**Perfect for:** Subscription-based services, B2B tools, productivity apps

**Key Features to Leverage:**
- ✅ Stripe subscription management
- ✅ User authentication & roles
- ✅ Database schema for users/accounts
- ✅ Dark mode for professional UI

**Suggested Additions:**
```
src/
├── app/
│   ├── dashboard/               # User dashboard
│   ├── billing/                # Subscription management
│   └── settings/               # User preferences
├── components/
│   ├── dashboard/              # Dashboard components
│   ├── billing/                # Billing components
│   └── analytics/              # Usage analytics
└── lib/
    ├── billing.ts              # Billing logic
    └── analytics.ts            # Analytics tracking
```

### 2. **Social Platform** 👥
**Perfect for:** Social networks, community platforms, content sharing

**Key Features to Leverage:**
- ✅ User authentication & profiles
- ✅ Database schema for social features
- ✅ Responsive design

**Suggested Additions:**
```
src/
├── app/
│   ├── profile/[id]/           # User profiles
│   ├── feed/                   # Content feed
│   ├── explore/                # Discovery
│   └── messages/               # Direct messaging
├── components/
│   ├── social/                 # Social components
│   ├── feed/                   # Feed components
│   └── chat/                   # Messaging components
└── lib/
    ├── social.ts               # Social features
    └── realtime.ts             # WebSocket/real-time
```

### 3. **E-commerce Platform** 🛒
**Perfect for:** Online stores, marketplaces, digital products

**Key Features to Leverage:**
- ✅ Stripe payment processing
- ✅ User accounts & orders
- ✅ Database for products/orders

**Suggested Additions:**
```
src/
├── app/
│   ├── products/               # Product catalog
│   ├── cart/                   # Shopping cart
│   ├── orders/                 # Order management
│   └── admin/                  # Admin panel
├── components/
│   ├── products/               # Product components
│   ├── cart/                   # Cart components
│   └── checkout/               # Checkout flow
└── lib/
    ├── inventory.ts            # Inventory management
    └── shipping.ts             # Shipping calculations
```

### 4. **Gaming Platform** 🎮
**Perfect for:** Game launchers, gaming communities, game marketplaces

**Key Features to Leverage:**
- ✅ User authentication & profiles
- ✅ Database for games/users
- ✅ Dark mode for gaming aesthetic

**Suggested Additions:**
```
src/
├── app/
│   ├── games/                  # Game catalog
│   ├── library/                # User game library
│   ├── leaderboards/           # Game rankings
│   └── tournaments/            # Gaming events
├── components/
│   ├── games/                  # Game components
│   ├── leaderboards/           # Ranking components
│   └── tournaments/            # Event components
└── lib/
    ├── games.ts                # Game logic
    └── achievements.ts         # Achievement system
```

### 5. **Personal Website/Portfolio** 👤
**Perfect for:** Personal branding, portfolios, blogs

**Key Features to Leverage:**
- ✅ Responsive design
- ✅ Dark mode toggle
- ✅ SEO optimization

**Suggested Additions:**
```
src/
├── app/
│   ├── about/                  # About page
│   ├── projects/               # Portfolio projects
│   ├── blog/                   # Blog posts
│   └── contact/                # Contact form
├── components/
│   ├── portfolio/              # Portfolio components
│   ├── blog/                   # Blog components
│   └── contact/                # Contact components
└── lib/
    ├── blog.ts                 # Blog functionality
    └── contact.ts              # Contact form handling
```

### 6. **Educational Platform** 📚
**Perfect for:** Online courses, learning management systems, tutorials

**Key Features to Leverage:**
- ✅ User authentication & progress tracking
- ✅ Database for courses/users
- ✅ Responsive design for mobile learning

**Suggested Additions:**
```
src/
├── app/
│   ├── courses/                # Course catalog
│   ├── learn/                  # Learning interface
│   ├── progress/               # User progress
│   └── certificates/           # Achievement certificates
├── components/
│   ├── courses/                # Course components
│   ├── learning/               # Learning components
│   └── progress/               # Progress tracking
└── lib/
    ├── courses.ts              # Course management
    └── progress.ts             # Progress tracking
```

## 🛠️ Development Workflow

### 1. **Environment Setup**
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Configure: DATABASE_URL, STRIPE_KEYS, GITHUB_OAUTH, etc.

# Prepare Git hooks
npm run prepare
```

### 2. **Database Setup**
```bash
# Generate migrations from schema changes
npx drizzle-kit generate:pg

# Apply migrations to database
npx drizzle-kit migrate:pg

# Push schema directly (development)
npx drizzle-kit push:pg
```

### 3. **Development Commands**
```bash
# Start development server
npm run dev

# Run tests
npm run test              # Unit tests
npm run e2e               # End-to-end tests

# Code quality
npm run lint              # ESLint
npm run format:write      # Prettier
npm run typecheck         # TypeScript
```

### 4. **Adding New Features**
1. **Components:** Add to `src/components/` with proper TypeScript types
2. **Pages:** Create in `src/app/[locale]/` following Next.js 15 conventions
3. **API Routes:** Add to `src/app/api/` for backend functionality
4. **Database:** Modify `src/lib/schema.ts` and generate migrations
5. **Translations:** Update `messages/en.json` and `messages/es.json`

## 🔧 Key Technologies & Patterns

### **Frontend**
- **Next.js 15** with App Router and React Server Components
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Shadcn/ui** for component library
- **Framer Motion** for animations

### **Backend**
- **Next.js API Routes** for server-side logic
- **Drizzle ORM** with PostgreSQL (Neon)
- **NextAuth.js** for authentication
- **Stripe** for payments
- **Zod** for validation

### **Testing & Quality**
- **Jest** for unit testing
- **Playwright** for E2E testing
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for Git hooks

### **Deployment & DevOps**
- **Vercel** for hosting
- **GitHub Actions** for CI/CD
- **Neon** for PostgreSQL database
- **Stripe** for payment processing

## 📝 Best Practices

### **Code Organization**
- Use absolute imports with `@/` prefix
- Keep components small and focused
- Follow TypeScript strict mode
- Use Server Components by default, Client Components when needed

### **Database**
- Use Drizzle migrations for schema changes
- Implement proper relationships and constraints
- Use prepared statements (handled by Drizzle)
- Optimize queries with proper indexing

### **Security**
- Validate all inputs with Zod
- Use environment variables for secrets
- Implement proper authentication flows
- Sanitize user-generated content

### **Performance**
- Use Next.js Image component for images
- Implement proper caching strategies
- Optimize bundle size with code splitting
- Use React Server Components for server-side rendering

## 🚀 Deployment Checklist

- [ ] Set up environment variables in production
- [ ] Configure database (Neon PostgreSQL)
- [ ] Set up Stripe webhooks
- [ ] Configure GitHub OAuth
- [ ] Set up custom domain
- [ ] Configure SSL certificates
- [ ] Set up monitoring and analytics
- [ ] Test all functionality in production
- [ ] Set up backup strategies

This starter template provides a solid foundation for building any type of modern web application with enterprise-grade features and best practices built-in.

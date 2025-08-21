# ElysiaJS Game Server Development - Phase 1: Research and Planning

## Task Objective
Research and document ElysiaJS capabilities for developing a full turn-based MMO game server alongside Socket.IO for real-time turn processing and game state synchronization.

## Current State Assessment
- NextJS frontend with game UI components already implemented
- Drizzle ORM with PostgreSQL database schema for game data
- Need to separate game logic from frontend into dedicated game server
- Real-time requirements: simultaneous processing of individual timed turns/actions

## Future State Goal
A scalable ElysiaJS game server that handles all game logic, real-time turn processing, and provides RESTful APIs for the NextJS frontend to consume.

## Implementation Plan

### Step 1: ElysiaJS Core Concepts & Setup
- [x] Research ElysiaJS authentication patterns
- [x] Document validation and schema definition approaches
- [x] Understand authorization and middleware patterns
- [x] Plan CRUD operations for game entities

### Step 2: Game Server Architecture Design
- [ ] Design server structure with ElysiaJS + Socket.IO integration
- [ ] Plan API endpoints for game actions (missions, crafting, town contributions)
- [ ] Design real-time event system for turn processing
- [ ] Plan database integration with existing Drizzle schema

### Step 3: Core Game Logic Implementation
- [ ] Implement player management endpoints
- [ ] Implement mission system with cooldowns
- [ ] Implement crafting system
- [ ] Implement town objectives and contributions
- [ ] Implement game log system

### Step 4: Real-time Features
- [ ] Implement Socket.IO for real-time game updates
- [ ] Implement turn processing system
- [ ] Implement chat system (rooms and DMs)
- [ ] Implement live game state synchronization

### Step 5: Integration & Testing
- [ ] Connect NextJS frontend to ElysiaJS server
- [ ] Implement authentication bridge between NextAuth and ElysiaJS
- [ ] Test real-time features
- [ ] Performance optimization

## ElysiaJS Key Concepts & Code Snippets

### 1. Basic Server Setup
```typescript
import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'

const app = new Elysia()
    .use(swagger())
    .listen(3001)

console.log(`🦊 Game Server running at ${app.server?.hostname}:${app.server?.port}`)
```

### 2. Authentication & Authorization
```typescript
// User service with session management
export const userService = new Elysia({ prefix: '/user' })
    .state({
        user: {} as Record<string, string>,
        session: {} as Record<number, string>
    })
    .model({
        signIn: t.Object({
            username: t.String({ minLength: 1 }),
            password: t.String({ minLength: 8 })
        }),
        session: t.Cookie({
            token: t.Number()
        }, {
            secrets: 'game-server-secret'
        })
    })
    .post('/sign-in', async ({ body, store, cookie }) => {
        // Authentication logic
        const key = crypto.getRandomValues(new Uint32Array(1))[0]
        store.session[key] = body.username
        cookie.token.value = key
        return { success: true, message: `Signed in as ${body.username}` }
    }, {
        body: 'signIn',
        cookie: 'session'
    })

// Authorization macro
export const getUserId = new Elysia()
    .derive(({ cookie: { token }, store: { session }, status }) => {
        const username = session[token.value]
        if (!username) {
            return status(401, { success: false, message: 'Unauthorized' })
        }
        return { username }
    })
```

### 3. Game Entity Schemas
```typescript
// Player schema
const playerSchema = t.Object({
    id: t.String(),
    strength: t.Number(),
    stamina: t.Number(),
    coins: t.Number(),
    reputation: t.Number(),
    inventory: t.Record(t.String(), t.Number()),
    skills: t.Record(t.String(), t.Object({
        level: t.Number(),
        xp: t.Number()
    })),
    lastActionTimestamp: t.Date(),
    currentMission: t.Optional(t.Any())
})

// Mission schema
const missionSchema = t.Object({
    id: t.String(),
    name: t.String(),
    type: t.Union([t.Literal('gathering'), t.Literal('combat'), t.Literal('crafting')]),
    category: t.Union([t.Literal('skill'), t.Literal('combat')]),
    description: t.String(),
    requirements: t.Record(t.String(), t.Any()),
    rewards: t.Record(t.String(), t.Any()),
    skill: t.Optional(t.String()),
    level: t.Number()
})

// Game log schema
const gameLogSchema = t.Object({
    id: t.String(),
    playerId: t.String(),
    message: t.String(),
    type: t.Union([t.Literal('action'), t.Literal('town'), t.Literal('system')]),
    timestamp: t.Date()
})
```

### 4. Game Actions API
```typescript
export const gameActions = new Elysia({ prefix: '/game' })
    .use(userService)
    .use(getUserId)
    .model({
        player: playerSchema,
        mission: missionSchema,
        gameLog: gameLogSchema,
        startMission: t.Object({
            missionId: t.String()
        }),
        contributeToTown: t.Object({
            resource: t.String(),
            amount: t.Number()
        })
    })
    .get('/player/:id', async ({ params, db }) => {
        return await db.select().from(players).where(eq(players.id, params.id))
    }, {
        params: t.Object({ id: t.String() })
    })
    .post('/mission/start', async ({ body, username, db }) => {
        // Start mission logic with cooldown check
        const player = await db.select().from(players).where(eq(players.id, username))
        const now = new Date()
        const cooldownMs = 10 * 1000 // 10 seconds
        
        if (now.getTime() - player.lastActionTimestamp.getTime() < cooldownMs) {
            return { success: false, message: 'Action on cooldown' }
        }
        
        // Mission processing logic
        return { success: true, missionStarted: true }
    }, {
        body: 'startMission'
    })
    .post('/town/contribute', async ({ body, username, db }) => {
        // Town contribution logic
        return { success: true, contribution: body }
    }, {
        body: 'contributeToTown'
    })
```

### 5. Socket.IO Integration
```typescript
import { Server } from 'socket.io'
import { createServer } from 'http'

const httpServer = createServer()
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000", // NextJS frontend
        methods: ["GET", "POST"]
    }
})

// Socket.IO event handlers
io.on('connection', (socket) => {
    console.log('Player connected:', socket.id)
    
    // Join game room
    socket.on('join-game', (playerId) => {
        socket.join(`player-${playerId}`)
        socket.join('game-lobby')
    })
    
    // Handle turn actions
    socket.on('turn-action', async (data) => {
        const { playerId, action, missionId } = data
        
        // Process turn action
        const result = await processTurnAction(playerId, action, missionId)
        
        // Broadcast to all players in game
        io.to('game-lobby').emit('turn-processed', {
            playerId,
            action,
            result,
            timestamp: new Date()
        })
        
        // Send specific update to player
        socket.to(`player-${playerId}`).emit('player-update', result)
    })
    
    // Handle chat messages
    socket.on('chat-message', (data) => {
        const { room, message, playerId } = data
        io.to(room).emit('new-message', {
            playerId,
            message,
            timestamp: new Date()
        })
    })
    
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id)
    })
})

httpServer.listen(3002)
```

### 6. Real-time Turn Processing
```typescript
// Turn processing system
class TurnProcessor {
    private activeTurns = new Map<string, {
        playerId: string,
        action: string,
        startTime: Date,
        duration: number
    }>()
    
    async processTurn(playerId: string, action: string, missionId: string) {
        const turn = {
            playerId,
            action,
            startTime: new Date(),
            duration: 10000 // 10 seconds
        }
        
        this.activeTurns.set(playerId, turn)
        
        // Schedule turn resolution
        setTimeout(() => {
            this.resolveTurn(playerId, missionId)
        }, turn.duration)
        
        return { success: true, turnStarted: true }
    }
    
    private async resolveTurn(playerId: string, missionId: string) {
        const turn = this.activeTurns.get(playerId)
        if (!turn) return
        
        // Process mission completion
        const result = await this.processMissionCompletion(playerId, missionId)
        
        // Broadcast result
        io.to('game-lobby').emit('turn-resolved', {
            playerId,
            result,
            timestamp: new Date()
        })
        
        this.activeTurns.delete(playerId)
    }
}
```

### 7. Database Integration with Drizzle
```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { players, missions, gameLogs } from '../lib/schema'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

// Database operations
export const gameDb = {
    async getPlayer(id: string) {
        return await db.select().from(players).where(eq(players.id, id))
    },
    
    async updatePlayer(id: string, data: Partial<typeof players.$inferInsert>) {
        return await db.update(players)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(players.id, id))
    },
    
    async addGameLog(log: typeof gameLogs.$inferInsert) {
        return await db.insert(gameLogs).values(log)
    },
    
    async getGameLogs(playerId: string, limit = 50) {
        return await db.select()
            .from(gameLogs)
            .where(eq(gameLogs.playerId, playerId))
            .orderBy(desc(gameLogs.timestamp))
            .limit(limit)
    }
}
```

### 8. Error Handling & Validation
```typescript
// Custom error handling
const gameErrorHandler = new Elysia()
    .onError(({ code, error, set }) => {
        switch (code) {
            case 'VALIDATION':
                set.status = 400
                return {
                    success: false,
                    message: 'Invalid request data',
                    errors: error.all
                }
            case 'NOT_FOUND':
                set.status = 404
                return {
                    success: false,
                    message: 'Resource not found'
                }
            case 'UNAUTHORIZED':
                set.status = 401
                return {
                    success: false,
                    message: 'Unauthorized access'
                }
            default:
                set.status = 500
                return {
                    success: false,
                    message: 'Internal server error'
                }
        }
    })
```

## Technical Considerations

### Performance Optimization
- Use connection pooling for database connections
- Implement caching for frequently accessed game data
- Use Redis for session storage and real-time data
- Implement rate limiting for API endpoints

### Security
- Validate all input data with Zod schemas
- Implement proper authentication and authorization
- Use HTTPS in production
- Sanitize user inputs for chat system

### Scalability
- Design for horizontal scaling with multiple server instances
- Use message queues for heavy game processing
- Implement proper session management across instances
- Use load balancing for Socket.IO connections

## Next Steps
1. Set up ElysiaJS server with basic structure
2. Implement authentication bridge with NextAuth
3. Create core game action endpoints
4. Integrate Socket.IO for real-time features
5. Connect to existing Drizzle database
6. Test with NextJS frontend

## Notes
- ElysiaJS provides excellent TypeScript integration and validation
- Socket.IO will handle real-time turn processing and chat
- Database operations will use existing Drizzle schema
- Authentication will bridge NextAuth sessions to ElysiaJS
- Game logic will be completely separated from frontend

## Schema Synchronization Strategy

### Shared Schema Package
Create a shared npm package (`@game/shared-schemas`) containing:
- Common TypeScript interfaces and types
- Zod validation schemas
- Database schema definitions (Drizzle)
- API response/request types

### Schema Management Approaches

#### Option 1: Monorepo with Shared Package
```
game-project/
├── packages/
│   ├── shared-schemas/     # Shared types, schemas, validation
│   ├── nextjs-frontend/    # NextJS app
│   └── elysiajs-backend/   # ElysiaJS server
└── package.json
```

#### Option 2: Separate Repos with Shared Package
```
game-frontend/              # NextJS repo
├── package.json
└── src/
    └── types/
        └── game.ts         # Import from @game/shared-schemas

game-backend/               # ElysiaJS repo  
├── package.json
└── src/
    └── schemas/
        └── game.ts         # Import from @game/shared-schemas
```

### Synchronization Points

#### 1. Database Schema
- **Primary**: Drizzle schema in shared package
- **Frontend**: Import types from shared package
- **Backend**: Import schema and types from shared package
- **Migration**: Single source of truth for database changes

#### 2. API Contracts
- **Request/Response Types**: Defined in shared package
- **Validation**: Zod schemas in shared package
- **Versioning**: API versioning strategy for breaking changes

#### 3. Game State Types
- **Player Data**: Shared interfaces for player state
- **Mission Types**: Common mission definitions
- **Game Events**: Shared event type definitions

### Implementation Strategy

#### Phase 1: Setup Shared Package
```typescript
// @game/shared-schemas/src/index.ts
export * from './database'
export * from './api'
export * from './game'
export * from './validation'

// @game/shared-schemas/src/database.ts
import { pgTable, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const players = pgTable("player", {
  id: text("id").primaryKey(),
  strength: integer("strength").default(5).notNull(),
  // ... rest of schema
})

export type Player = typeof players.$inferSelect
export type NewPlayer = typeof players.$inferInsert
```

#### Phase 2: Frontend Integration
```typescript
// NextJS frontend
import { Player, Mission, startMissionSchema } from '@game/shared-schemas'

// Use shared types for API calls
const player: Player = await fetchPlayerData()
const missionData = startMissionSchema.parse(requestBody)
```

#### Phase 3: Backend Integration
```typescript
// ElysiaJS backend
import { players, Player, startMissionSchema } from '@game/shared-schemas'

export const gameActions = new Elysia({ prefix: '/game' })
  .post('/mission/start', async ({ body }) => {
    const validatedData = startMissionSchema.parse(body)
    // Process mission
  }, {
    body: startMissionSchema
  })
```

### Versioning Strategy

#### API Versioning
- Use URL versioning: `/api/v1/game/...`
- Maintain backward compatibility for at least one version
- Document breaking changes in shared package

#### Schema Evolution
- Additive changes only (new fields optional)
- Breaking changes require new API version
- Database migrations handled by Drizzle

### Development Workflow

#### 1. Schema Changes
1. Update shared package schema
2. Publish new version of shared package
3. Update both frontend and backend to use new version
4. Run database migrations

#### 2. Feature Development
1. Define types in shared package first
2. Implement backend API with shared validation
3. Implement frontend with shared types
4. Test integration

#### 3. Deployment Coordination
- Deploy backend first (new API endpoints)
- Deploy frontend second (uses new endpoints)
- Use feature flags for gradual rollout

### Tools & Automation

#### 1. Type Generation
```json
// package.json scripts
{
  "scripts": {
    "generate-types": "drizzle-kit generate",
    "build-schemas": "tsc --project packages/shared-schemas",
    "publish-schemas": "npm publish packages/shared-schemas"
  }
}
```

#### 2. CI/CD Pipeline
- Validate schema consistency across repos
- Run type checking with shared schemas
- Automated testing of API contracts

#### 3. Development Tools
- TypeScript strict mode enabled
- ESLint rules for shared type usage
- Pre-commit hooks for schema validation

### Best Practices

#### 1. Single Source of Truth
- Database schema defined once in shared package
- API contracts defined once in shared package
- Game logic types defined once in shared package

#### 2. Type Safety
- Use strict TypeScript configuration
- Validate all API inputs/outputs with Zod
- Generate types from database schema

#### 3. Documentation
- Document all schema changes
- Maintain API documentation
- Keep migration history

#### 4. Testing
- Test API contracts with shared schemas
- Validate type compatibility
- Integration tests for schema changes

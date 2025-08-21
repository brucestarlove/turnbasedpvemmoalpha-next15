# Supabase Realtime Integration Plan

## Overview
Transform the Next.js game to use Supabase Realtime for WebSocket-like functionality without a separate server. This provides real-time updates for multiplayer interactions while maintaining the current repository pattern.

## Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Supabase      │    │   Database      │
│   (Frontend)    │◄──►│   Realtime      │◄──►│   (Neon/PG)     │
│                 │    │                 │    │                 │
│ • Game UI       │    │ • WebSockets    │    │ • Player Data   │
│ • Zustand State │    │ • Subscriptions │    │ • Town State    │
│ • User Actions  │    │ • Broadcasting  │    │ • Game Logs     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Implementation Steps

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js
```

### 2. Database Schema Changes
Add realtime-friendly tables and enable realtime subscriptions:

```sql
-- Enable realtime for existing tables
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE towns;
ALTER PUBLICATION supabase_realtime ADD TABLE game_logs;

-- Create game events table for real-time actions
CREATE TABLE game_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'mission_complete', 'town_contribute', 'chat_message'
  event_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable realtime for game events
ALTER PUBLICATION supabase_realtime ADD TABLE game_events;
```

### 3. Supabase Client Configuration
```typescript
// src/lib/supabase-realtime.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limiting for performance
    },
  },
})
```

### 4. Zustand Store with Realtime Integration
```typescript
// src/stores/game-store.ts
import { create } from 'zustand'
import { supabaseClient } from '@/lib/supabase-realtime'
import type { Player, Town, GameLog } from '@/lib/types'

interface GameState {
  // State
  player: Player | null
  town: Town | null
  logs: GameLog[]
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting'
  
  // Actions
  initializeGame: (userId: string) => Promise<void>
  subscribeTo: (userId: string) => void
  unsubscribe: () => void
  updatePlayer: (updates: Partial<Player>) => void
  updateTown: (updates: Partial<Town>) => void
  addLog: (log: GameLog) => void
}

export const useGameStore = create<GameState>((set, get) => ({
  player: null,
  town: null,
  logs: [],
  connectionStatus: 'disconnected',
  
  initializeGame: async (userId: string) => {
    // Initialize with server actions as fallback
    const response = await getGameState(userId)
    if (response.success) {
      set({
        player: response.data.player,
        town: response.data.town,
        logs: response.data.logs
      })
    }
  },
  
  subscribeTo: (userId: string) => {
    // Subscribe to player changes
    const playerSubscription = supabaseClient
      .channel(`player:${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'players',
        filter: `id=eq.${userId}`
      }, (payload) => {
        set({ player: payload.new as Player })
      })
      .subscribe()
      
    // Subscribe to town changes
    const townSubscription = supabaseClient
      .channel('town-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public', 
        table: 'towns'
      }, (payload) => {
        set({ town: payload.new as Town })
      })
      .subscribe()
      
    // Subscribe to game events
    const eventsSubscription = supabaseClient
      .channel('game-events')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'game_events'
      }, (payload) => {
        // Handle real-time game events
        const event = payload.new
        if (event.event_type === 'town_updated') {
          // Refresh town data
          get().refreshTownData()
        }
      })
      .subscribe()
  },
  
  unsubscribe: () => {
    supabaseClient.removeAllChannels()
  },
  
  updatePlayer: (updates) => {
    set(state => ({ 
      player: state.player ? { ...state.player, ...updates } : null 
    }))
  },
  
  updateTown: (updates) => {
    set(state => ({ 
      town: state.town ? { ...state.town, ...updates } : null 
    }))
  },
  
  addLog: (log) => {
    set(state => ({ logs: [log, ...state.logs.slice(0, 29)] }))
  }
}))
```

### 5. Update Game Actions with Events
```typescript
// src/actions/game-actions.ts - Add event publishing
export async function completeMission(
  userId: string, 
  missionId: string,
  combatSkill?: string
): Promise<ApiResponse<{ player: Player; town: Town; logs: GameLog[] }>> {
  try {
    // ... existing mission logic ...
    
    // Publish event for real-time updates
    await supabaseClient.from('game_events').insert({
      player_id: userId,
      event_type: 'mission_complete',
      event_data: { missionId, rewards: missionRewards }
    })
    
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 6. Update Components to Use Store
```typescript
// src/components/game/game-layout.tsx
'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/stores/game-store'

export const GameLayout = ({ userId }: { userId: string }) => {
  const { 
    player, town, logs, connectionStatus,
    initializeGame, subscribeTo, unsubscribe 
  } = useGameStore()
  
  useEffect(() => {
    // Initialize game data
    initializeGame(userId)
    
    // Setup realtime subscriptions
    subscribeTo(userId)
    
    // Cleanup on unmount
    return () => {
      unsubscribe()
    }
  }, [userId])
  
  return (
    <div className="container mx-auto max-w-7xl p-4">
      {/* Connection status indicator */}
      <div className={`status-indicator ${connectionStatus}`}>
        {connectionStatus === 'connected' ? '🟢' : '🔴'} {connectionStatus}
      </div>
      
      {/* Rest of your UI using player, town, logs from store */}
    </div>
  )
}
```

## Benefits

### ✅ Advantages
- **Real-time updates** without separate server
- **Per-user isolation** maintained through userId filtering
- **Automatic reconnection** built into Supabase client
- **Rate limiting** and **authentication** included
- **Works with existing Neon database**
- **Scales automatically** with Supabase infrastructure

### 🚧 Considerations  
- **Supabase subscription costs** for realtime usage
- **Network dependency** for real-time features
- **Event ordering** may need handling for complex interactions

## Alternative: Server-Sent Events (SSE)
If you prefer to avoid Supabase dependency:

```typescript
// src/app/api/events/route.ts - Simple SSE endpoint
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  
  const stream = new ReadableStream({
    start(controller) {
      // Send game state updates as SSE
      const interval = setInterval(async () => {
        const gameState = await getGameState(userId)
        controller.enqueue(
          `data: ${JSON.stringify(gameState)}\n\n`
        )
      }, 2000)
      
      return () => clearInterval(interval)
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}
```

## Recommendation
**Go with Supabase Realtime** - it's perfect for your use case and provides true real-time multiplayer without server complexity.
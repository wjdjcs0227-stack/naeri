import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';
export const whispers = sqliteTable('whispers', {
 id: integer('id').primaryKey({ autoIncrement: true }),
 room: text('room').notNull(),
 body: text('body').notNull(),
 author: text('author').notNull(),
 createdAt: integer('created_at').notNull(),
}, table => [index('whispers_room_id').on(table.room, table.id), index('whispers_author_time').on(table.author, table.createdAt)]);

export const rooftopPresence = sqliteTable('rooftop_presence', {
 tabId: text('tab_id').primaryKey(),
 visitorId: text('visitor_id').notNull(),
 lastSeen: integer('last_seen').notNull(),
}, table => [index('rooftop_presence_last_seen').on(table.lastSeen)]);

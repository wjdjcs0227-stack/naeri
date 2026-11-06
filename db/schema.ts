import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';
export const whispers = sqliteTable('whispers', {
 id: integer('id').primaryKey({ autoIncrement: true }),
 room: text('room').notNull(),
 body: text('body').notNull(),
 author: text('author').notNull(),
 createdAt: integer('created_at').notNull(),
}, table => [index('whispers_room_id').on(table.room, table.id), index('whispers_author_time').on(table.author, table.createdAt)]);

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: text('id').primaryKey(), // Supabase Auth ID
    name: text('name').notNull(),
    email: text('email').notNull(),
    avatarUrl: text('avatar_url'),
    updatedAt: text('updated_at').notNull(),
    syncedAt: text('synced_at'),
});

export const artworks = sqliteTable('artworks', {
    id: text('id').primaryKey(), // UUID
    displayId: text('display_id'), // ART-YYYY-XXXXX
    name: text('name').notNull(),
    artist: text('artist'),
    type: text('type').$type<'painting' | 'sculpture' | 'mural' | 'tile' | 'relief' | 'other'>().notNull(),
    conservationStatus: text('conservation_status').$type<'good' | 'fair' | 'poor' | 'urgent' | 'unknown'>().notNull(),
    notes: text('notes'),
    latitude: real('latitude'),
    longitude: real('longitude'),
    address: text('address'),
    deviceId: text('device_id').notNull(),
    updatedAt: text('updated_at').notNull(),
    syncedAt: text('synced_at'),
    deletedAt: text('deleted_at'),
});

export const inspections = sqliteTable('inspections', {
    id: text('id').primaryKey(),
    artworkId: text('artwork_id').notNull().references(() => artworks.id),
    technicalForm: text('technical_form').notNull(), // JSON string (validação via Zod no domain)
    formVersion: integer('form_version').default(1).notNull(),
    deviceId: text('device_id').notNull(),
    updatedAt: text('updated_at').notNull(),
    syncedAt: text('synced_at'),
    deletedAt: text('deleted_at'),
});

export const photos = sqliteTable('photos', {
    id: text('id').primaryKey(),
    inspectionId: text('inspection_id').notNull().references(() => inspections.id),
    artworkId: text('artwork_id').notNull().references(() => artworks.id),
    localPath: text('local_path').notNull(),
    remoteUrl: text('remote_url'),
    uploadStatus: text('upload_status').$type<'pending' | 'uploading' | 'done' | 'failed'>().notNull(),
    label: text('label').$type<'front' | 'detail' | 'context'>().notNull(),
    order: integer('order').notNull(),
    deviceId: text('device_id').notNull(),
    updatedAt: text('updated_at').notNull(),
    syncedAt: text('synced_at'),
    deletedAt: text('deleted_at'),
});

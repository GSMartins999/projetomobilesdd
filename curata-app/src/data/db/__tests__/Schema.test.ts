import { users, artworks, inspections, photos } from '../schema';

describe('Database Schema', () => {
    it('should define users table correctly', () => {
        expect(users).toBeDefined();
        expect(users.id).toBeDefined();
        expect(users.email).toBeDefined();
    });

    it('should define artworks table correctly', () => {
        expect(artworks).toBeDefined();
        expect(artworks.id).toBeDefined();
        expect(artworks.name).toBeDefined();
        expect(artworks.type).toBeDefined();
    });

    it('should define inspections table correctly', () => {
        expect(inspections).toBeDefined();
        expect(inspections.id).toBeDefined();
        expect(inspections.artworkId).toBeDefined();
    });

    it('should define photos table correctly', () => {
        expect(photos).toBeDefined();
        expect(photos.id).toBeDefined();
        expect(photos.inspectionId).toBeDefined();
    });
});

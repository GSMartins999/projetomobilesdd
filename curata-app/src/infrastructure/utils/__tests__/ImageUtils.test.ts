import { Platform } from 'react-native';
import { ImageUtils } from '../ImageUtils';

jest.mock('react-native', () => ({
    Platform: {
        OS: 'android',
        select: jest.fn(),
    },
}));

describe('ImageUtils', () => {
    describe('getImageUri', () => {
        it('should return null for null or undefined', () => {
            expect(ImageUtils.getImageUri(null)).toBeNull();
            expect(ImageUtils.getImageUri(undefined)).toBeNull();
        });

        it('should return remote URLs unchanged', () => {
            const url = 'https://example.com/image.jpg';
            expect(ImageUtils.getImageUri(url)).toBe(url);
        });

        it('should add file:// prefix on Android if missing and path is absolute', () => {
            (Platform.OS as any) = 'android';
            const path = '/data/user/0/cache/image.jpg';
            expect(ImageUtils.getImageUri(path)).toBe(`file://${path}`);
        });

        it('should not add double file:// prefix on Android', () => {
            (Platform.OS as any) = 'android';
            const path = 'file:///data/user/0/cache/image.jpg';
            expect(ImageUtils.getImageUri(path)).toBe(path);
        });

        it('should return unchanged on iOS', () => {
            (Platform.OS as any) = 'ios';
            const path = '/Users/me/Documents/image.jpg';
            expect(ImageUtils.getImageUri(path)).toBe(path);
        });
    });
});

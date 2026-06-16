jest.unmock('react-i18next');
import i18n from '../index';

describe('i18n Configuration', () => {
    it('should initialize with pt-BR as the default language', () => {
        expect(i18n.language).toBe('pt-BR');
    });
});

import { AuthRepository } from '../repositories/AuthRepository';
import { User } from '../entities/User';

export class LoginUseCase {
    constructor(private readonly authRepository: AuthRepository) { }

    async execute(email: string, password: string): Promise<{ user: User; token: string }> {
        if (!email.trim() || !password.trim()) {
            throw new Error('E-mail e senha são obrigatórios');
        }

        try {
            return await this.authRepository.signIn(email.trim(), password.trim());
        } catch (error: any) {
            throw new Error(error.message || 'Erro ao realizar login');
        }
    }
}

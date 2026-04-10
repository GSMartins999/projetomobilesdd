import { AuthRepository } from '../repositories/AuthRepository';

export class LogoutUseCase {
    constructor(private readonly authRepository: AuthRepository) { }

    async execute(): Promise<void> {
        await this.authRepository.signOut();
    }
}

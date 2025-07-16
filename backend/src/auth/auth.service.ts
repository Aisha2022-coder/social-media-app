import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../users/user.schema';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async signup(username: string, email: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.usersService.create({
            username,
            email,
            password: hashedPassword,
        });

        return this.generateTokens(String(user._id)); // ✅ Fix here
    }

    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new UnauthorizedException('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid password');

        return this.generateTokens(String(user._id)); // ✅ Fix here
    }

    private generateTokens(userId: string) {
        const payload = { sub: userId };

        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: process.env.JWT_EXPIRATION || '1h',
        });

        return { accessToken };
    }
}



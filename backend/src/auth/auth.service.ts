import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async signup(username: string, email: string, password: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const user = await this.usersService.create({
                username,
                email,
                password: hashedPassword,
            });
            return this.generateTokens(String(user._id));
        } catch (err: any) {
            if (err.code === 11000) { // MongoDB duplicate key error
                throw new Error('Email already exists');
            }
            throw err;
        }
    }

    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new UnauthorizedException('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid password');

        return this.generateTokens(String(user._id)); 
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



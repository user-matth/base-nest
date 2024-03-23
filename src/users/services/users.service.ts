import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginInfo: { email: string; password: string }): Promise<{ access_token: string }> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: loginInfo.email,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(loginInfo.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async createUser(data: Prisma.UserCreateInput): Promise<{ user: User; token: string }> {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: data.email,
            },
        });

        if (existingUser) {
            throw new ConflictException('Email is already in use');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
            },
        });

        const token = this.jwtService.sign({ email: user.email, sub: user.id });
        return { user, token };
    }

    async deleteUser(userId: number) {
        return this.prisma.user.delete({
            where: { id: userId },
        });
    }

}

import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) {}

    async createUser(data: Prisma.UserCreateInput): Promise<{ user: User; token: string }> {
        const existingUser = await this.prisma.user.findUnique({
          where: {
            email: data.email,
          },
        });
    
        if (existingUser) {
          throw new ConflictException('Email is already in use');
        }
    
        const user = await this.prisma.user.create({ data });
        const token = this.jwtService.sign({ email: user.email, sub: user.id });
        return { user, token };
      }

    async deleteUser(userId: number) {
        return this.prisma.user.delete({
          where: { id: userId },
        });
    }
    
}

import { Controller, Post, Body, Delete, Param } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { User } from '@prisma/client';

@Controller('auth')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('signup')
    async signUp(@Body() userData: { name: string; email: string; password: string }) {
        const { user, token } = await this.usersService.createUser(userData);
        return { user: { id: user.id, name: user.name, email: user.email }, token };
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(+id);
    }
}

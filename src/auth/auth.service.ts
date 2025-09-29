import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt'
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async register({ name, email, password }: RegisterDto) {
    const user = await this.userService.findOneByEmail(email);
    if (user) {
      throw new BadRequestException('El usuario ya existe');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return await this.userService.create({ 
      name, 
      email, 
      password: hashedPassword });
  }

  async login({email, password} : LoginDto) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email incorrecto');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

  const payload = { 
      sub: user.id,   
      email: user.email,
      name: user.name  
    };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: jwtConstants.expiresIn,
    });

    const { password: _, ...userWithoutPassword } = user;
    return { 
      access_token: token, 
      user: userWithoutPassword 
    };

  }

}

import { Injectable, NotFoundException, UnauthorizedException, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) { }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // --------------------------------------------------------
  // CREATE USER with Prisma Error Handling (P2002 Unique)
  // --------------------------------------------------------
  async create(data) {
    try {
      // 1. Passwort hashen
      const hashedPassword = await this.authService.hashPassword(data.password);

      // 2. Daten für Prisma vorbereiten
      const userData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        birth_date: new Date(data.birth_date),
        phone: data.phone ?? null,
        profile_image: data.profile_image ?? null,
        additional_note: data.additional_note ?? null,
        passwordHash: hashedPassword,
      };

      // 3. User erstellen
      const result = await this.prisma.user.create({
        data: userData,
      });

      return result;

    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new Error('Email already taken.');
      }
      throw err;
    }
  }



  // --------------------------------------------------------
  // UPDATE USER
  // --------------------------------------------------------
  updateUser(id: number, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // --------------------------------------------------------
  // DELETE USER
  // --------------------------------------------------------
  async deleteUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  // --------------------------------------------------------
  // UPDATE PASSWORD
  // --------------------------------------------------------
  async updatePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    const isValid = await this.authService.comparePasswords(
      oldPassword,
      user.passwordHash,
    );

    if (!isValid) throw new UnauthorizedException('Old password incorrect');

    const newHash = await this.authService.hashPassword(newPassword);

    return this.prisma.user.update({
      where: { id },
      data: { passwordHash: newHash },
    });
  }

  // --------------------------------------------------------
  // UPDATE BALANCE
  // --------------------------------------------------------
  async updateBalance(userId: number, amount: number) {
    const user = await this.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    const newBalance = (user.balance || 0) + amount;
    if (newBalance < 0) {
      throw new Error('Guthaben kann nicht negativ sein.');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });
  }

  // --------------------------------------------------------
  // SET BALANCE (absoluter Wert)
  // --------------------------------------------------------
  async setBalance(userId: number, balance: number) {
    const user = await this.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    if (balance < 0) {
      throw new Error('Guthaben kann nicht negativ sein.');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { balance },
    });
  }

  // --------------------------------------------------------
  // GET BALANCE
  // --------------------------------------------------------
  async getBalance(userId: number) {
    const user = await this.findOne(userId);
    if (!user) throw new NotFoundException('User not found');
    return user.balance || 0;
  }
}

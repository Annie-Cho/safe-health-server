import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from '../grades/entities/grade.entity';
import { UpdateUserInput } from './dto/updateUser.input';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
  ) {}

  findAll() {
    return this.userRepository.find();
  }

  findAllWithDeleted() {
    return this.userRepository.find({ withDeleted: true });
  }

  async findOne(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create({ hashedPwd: password, email, name, address, addressDetail }) {
    const grade = await this.gradeRepository.findOne({
      where: { name: '브론즈' },
    });

    return this.userRepository.save({
      email,
      password, //
      name,
      address,
      addressDetail,
      grade,
    });
  }

  async update(user: User, updateUserInput: UpdateUserInput): Promise<User> {
    return this.userRepository.save({
      ...user,
      ...updateUserInput,
    });
  }

  async updatePwd({ email, hashedPwd: pwd }) {
    const user = await this.userRepository.findOne({ where: { email } });

    return this.userRepository.save({
      ...user,
      id: user.id,
      pwd,
    });
  }

  async delete({ email }) {
    const result = await this.userRepository.softDelete({ email });
    return result.affected;
  }

  async restore({ email }) {
    const result = await this.userRepository.restore({ email });
    return result.affected;
  }

  async checkIsAvailable({ email }) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      throw new UnprocessableEntityException('이미 사용중인 아이디입니다.');
    }
  }

  async checkIsAdmin(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user.admin) {
      throw new UnprocessableEntityException('관리자가 아닙니다.');
    }
    return true;
  }
}

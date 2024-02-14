import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Task } from "../../tasks/entities/task.entity";
import { Role } from "../enums/role.enum";


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number
    
    @Column({unique:true})
    email: string;

    @Column({select:false})
    password:string;
    
    @Column({ type: 'enum', enum: Role })
    role: Role

    @OneToMany(type=>Task, task=>task.creator)
    task: Task[]
}

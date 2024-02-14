import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../enums/role.enum";
import { Task } from "../../tasks/entities/task.entity";


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number
    
    @Column({unique:true})
    email: string;

    @Column({select:false})
    password:string;
    
    // @Column({enum:Role, default:Role.Regular})
    @Column({ type: 'enum', enum: Role })
    role: Role

    // @ManyToMany((type)=>Task, (task)=>task.createdBy)
    // createdTask?: Task[]
    @OneToMany(type=>Task, task=>task.creator)
    task: Task[]
}

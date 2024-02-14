import { User } from "../../users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn,JoinTable, ManyToMany } from "typeorm";

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title:string

    @Column()
    body:string

    @ManyToOne(type=>User, user=>user.task)
    creator: User

}


import { RequestStatus } from "src/common/enums/friend-request-status.enum";
import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from "typeorm";

@Entity('friendships')
@Index(["userId1","userId2"],{unique:true})
export class FriendShip {
    @PrimaryColumn({name: 'user_id1'})
    userId1: string;
    
    @PrimaryColumn({name: 'user_id2'})
    userId2: string;

    @Column({name:'requested_by'})
    requestedBy: string;
    
    @Column({
        name: 'status',
        type: 'enum',
        enum: RequestStatus,
        default: RequestStatus.PENDING
    })
    status: string;

    @CreateDateColumn({name: 'created_at'})
    createdAt: string;
}
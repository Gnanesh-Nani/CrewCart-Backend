import { RideStatus } from "src/common/enums/ride-status.enum";
import { RideVisiblity } from "src/common/enums/ride-types.enum";
import { Column, Entity, PrimaryGeneratedColumn,CreateDateColumn } from "typeorm";

@Entity('rides')
export class Ride {
    @PrimaryGeneratedColumn('increment',{type:'bigint'})
    id: string;

    @Column({type: 'varchar',length:100})
    title: string;

    @Column({type: 'text'})
    description: string;

    @Column({type:'bigint',name:'creator_id'})
    creatorId: string;

    @Column({type:'enum',enum:RideVisiblity,name:'visiblity'})
    visiblity: string;

    @Column({type: 'bigint',name:'community_id',default:null})
    communityId: string;

    @Column({type:'enum',enum:RideStatus,default:RideStatus.CREATED,name:'ride_status'})
    rideStatus: RideStatus;

    @Column({name:'start_time',type:'datetime'})
    startTime: Date;

    @Column({name:'end_time',type:'datetime'})
    endTime: Date;

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date;
}

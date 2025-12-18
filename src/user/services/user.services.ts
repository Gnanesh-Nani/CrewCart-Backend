import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { handleError } from "src/common/utils/handle-error";
import { handleResponse } from "src/common/utils/response.utils";
import { UpdateProfileDto } from "../dtos/updateProfile.dto";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>
    ){}

    async getProfile(user_id : string) {
        try {
            const user  = await this.userRepository.findOne(
                {
                    where:{id:user_id},
                    relations:{profile:true},
                    select:{
                        id:true,
                        status:true,
                        profile: {
                            fullName:true,
                            avatarUrl:true,
                            bikeModel:true,
                            bikeNumber:true,
                            userName:true,
                            bio:true,
                            createdAt:true
                        }
                    }
                }
            )
            if(!user)
                return handleError("Profile Not Found",404);
            return handleResponse(user);
        } catch (error) {
            return handleError(error.message)
        }
    }

    async getMyProfile(){
        return;
    }

    async updateProfile(user_id: string,updateProfileDto: Partial<UpdateProfileDto>) {
        try {
            let user = await this.userRepository.findOne({
                where:{
                    id:user_id
                }
            })
            if(!user)
                return handleError("Profile Not Found",404);
            let updatedProfileData = {...user.profile,...updateProfileDto};
            user.profile = updatedProfileData;
            await this.userRepository.save(user);
            return handleResponse("Profile Updated Successfully");
        }catch(error) {
            return handleError(error.message)
        }
    }
}
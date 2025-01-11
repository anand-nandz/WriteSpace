import { IUserRepository } from "../interfaces/repositoryInterface/user.Repository.Interface";
import User, { UserDocument } from "../models/userModel";
import { BaseRepository } from "./baseRepository";

class UserRepository extends BaseRepository<UserDocument> implements IUserRepository{
    constructor(){
        super(User);
    }
}
export default UserRepository;
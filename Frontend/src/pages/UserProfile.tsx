import {
    Avatar,
    Button,
    Card,
    Typography,
    Chip,
} from "@material-tailwind/react";
import { Mail, Phone, Badge, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UserRootState from "../redux/rootstate/UserState";
import { showToastMessage } from "../utils/toast";
import { axiosInstance } from "../config/api/axiosInstance";
import { setUserInfo } from "../redux/slices/UserSlice";
import EditProfileModal from "../components/user/editProfile";
import { formatDate } from "../utils/interfaces/interfaces";

const UserProfile = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: UserRootState) => state.user.userData);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const getPro = async () => {
        await axiosInstance.get('/profile', {
            withCredentials: true,

        });
    }
    useEffect(() => {
        getPro()
    }, [])

    const handleSaveProfile = useCallback(async (updates: FormData) => {
        try {

            const token = localStorage.getItem('userToken');
            if (!token) {
                showToastMessage('Authentication required', 'error');
                return;
            }

            const response = await axiosInstance.put('/profile', updates, {
                withCredentials: true,
                headers: {
                    "Content-Type": 'multipart/form-data',
                },
            });

            dispatch(setUserInfo(response.data.user));
            showToastMessage('Profile updated successfully', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            showToastMessage('Error updating profile', 'error');
        }
    }, [dispatch]);

    return (
        <>
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="w-full max-w-[1000px] mb-2" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                        <motion.div
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative h-40 md:h-64 w-full overflow-hidden rounded-t-xl"
                        >
                            <img src={"/images/writespace2.jpeg"} alt="Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20" />
                        </motion.div>

                        <div className="relative px-4 py-4 sm:px-6">
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="flex flex-col justify-between items-start "
                            >
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full md:w-auto">
                                    <Avatar
                                        size="xxl"
                                        placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
                                        className="h-32 w-32 ring-4 ring-white -mt-20 relative"
                                        src={user?.image || "/images/userdefault.jpg"}
                                    />
                                    <div className="space-y-2 max-w-full">
                                        <Typography variant="h4" className="text-2xl font-bold text-black" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                            {user?.name}
                                        </Typography>
                                        <div className="flex items-center gap-2 break-all">
                                            <Mail className="h-4 w-4 flex-shrink-0 text-black" />
                                            <Typography className="text-gray-600 break-all" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                                {user?.email}
                                            </Typography>
                                        </div>


                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-black" />
                                            <Typography className="text-gray-600" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                                {user?.contactinfo || 'N/A'}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <Chip
                                        color={user?.isActive ? "green" : "gray"}
                                        value={user?.isActive ? "Active" : "Inactive"}
                                        className="rounded-full text-sm"
                                    />
                                    {user?.isGoogleUser && (
                                        <Chip
                                            color="blue"
                                            value="Google Account"
                                            className="rounded-full text-sm"
                                        />
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        <div className="px-6 pb-6 rounded-none">
                            <div className=" gap-4">
                                <Card className="p-4 bg-gray-50" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                    <Typography variant="h6" className="text-center mb-6" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                        Account Information
                                    </Typography>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-2">
                                            <Badge className="h-4 w-4" />
                                            <Typography className="text-sm text-gray-600" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                                ID: {user?._id?.slice(-6)}
                                            </Typography>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <Typography className="text-sm text-gray-600" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                                Joined: {formatDate(user?.createdAt)}
                                            </Typography>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
                                                onClick={() => setIsEditModalOpen(true)}
                                                className="flex items-center gap-2 bg-black"
                                            >
                                                Edit Profile
                                            </Button>

                                        </div>
                                    </div>
                                </Card>

                            </div>


                        </div>
                    </Card>
                </div>
                {user && (
                    <EditProfileModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        user={user}
                        onSave={handleSaveProfile}
                    />
                )}
            </div>



        </>
    )
}

export default UserProfile
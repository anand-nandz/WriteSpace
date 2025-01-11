import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Link as NextUILink,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Avatar,
} from "@nextui-org/react";
import { USER } from "../../utils/constants/constants";
import UserRootState from "../../redux/rootstate/UserState";
import { useDispatch, useSelector } from "react-redux";
import { showToastMessage } from "../../utils/toast";
import { axiosInstance } from "../../config/api/axiosInstance";
import { logout } from '../../redux/slices/UserSlice';
import { ChevronDown } from "lucide-react";

const WriteSpaceLogo: React.FC = () => (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
        <path
            clipRule="evenodd"
            d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
            fill="currentColor"
            fillRule="evenodd"
        />
    </svg>
);

export function WritSpaceNavbar() {
    const user = useSelector((state: UserRootState) => state.user.userData);
    const isAuthenticated = useSelector((state: UserRootState) => state.user.isUserSignedIn);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/logout');
            localStorage.removeItem('userToken')
            dispatch(logout());
            navigate(`${USER.LOGIN}`);
            showToastMessage('Logged out successfully', 'success');
        } catch (error) {
            console.log('Logout Error', error);
            showToastMessage('Error during logout', 'error');
        }
    };


    return (
        <Navbar maxWidth="full" className="bg-[#1a1a1a]">
            <NavbarBrand>
                <WriteSpaceLogo />
                <p className="font-bold text-inherit text-white">WriteSpace</p>
            </NavbarBrand>

            <NavbarContent className="hidden sm:flex gap-4" justify="center">
                {isAuthenticated && (
                    <>
                        <NavbarItem>
                            <NextUILink href={USER.HOME} className="text-white text-lg font-medium">
                                Home
                            </NextUILink>
                        </NavbarItem>
                        <Dropdown>
                            <NavbarItem>
                                <DropdownTrigger>
                                    <Button
                                        disableRipple
                                        className="bg-transparent text-white text-lg font-medium p-0 data-[hover=true]:bg-transparent"
                                        endContent={<ChevronDown className="w-4 h-4 ml-1" />}
                                    >
                                        Blogs
                                    </Button>
                                </DropdownTrigger>
                            </NavbarItem>
                            <DropdownMenu>
                                <DropdownItem key="all-blogs" onPress={() => navigate(USER.ALL_BLOG)}>
                                    All Blogs
                                </DropdownItem>
                                <DropdownItem key="all-blogs" onPress={() => navigate(USER.BLOGS)}>
                                    My Blogs
                                </DropdownItem>
                                <DropdownItem key="create-blog" onPress={() => navigate(USER.CREATE_BLOG)}>
                                    Create Blog
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>

                        <NavbarItem>
                            <NextUILink href={USER.ABOUT_US} className="text-white text-lg font-medium">
                                About Us
                            </NextUILink>
                        </NavbarItem>
                    </>
                )}
            </NavbarContent>


            <NavbarContent justify="end">
                {isAuthenticated ? (
                    <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                            <Avatar
                                isBordered
                                as="button"
                                className="transition-transform"
                                color="default"
                                name="User Name"
                                size="sm"
                                src={user?.image || "/images/user.png"}
                            />
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Profile Actions" variant="flat">
                            <DropdownItem key="profile" className="h-14 gap-2">
                                <p className="font-semibold">Signed in as</p>
                                <p className="font-semibold">{user?.email}</p>
                            </DropdownItem>
                            <DropdownItem key="settings" onPress={() => navigate(USER.PROFILE)}>Profile</DropdownItem>
                            <DropdownItem key="logout" color="danger" onPress={handleLogout}>
                                Log Out
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                ) : (
                    <>
                        <NavbarItem>
                            <Button
                                onPress={() => navigate(USER.LOGIN)}
                                style={{ backgroundColor: "white", color: "#273040" }}
                            >
                                Login
                            </Button>
                        </NavbarItem>
                        <NavbarItem>
                            <Button
                                onPress={() => navigate(USER.SIGNUP)}
                                style={{ backgroundColor: "white", color: "#273040" }}
                            >
                                Sign Up
                            </Button>
                        </NavbarItem>
                    </>
                )}
            </NavbarContent>
        </Navbar>
    );
}


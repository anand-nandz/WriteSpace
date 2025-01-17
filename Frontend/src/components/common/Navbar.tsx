import React, { useState } from "react";
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
    NavbarMenuToggle,
    NavbarMenu,
    NavbarMenuItem,
    Image,
} from "@nextui-org/react";
import { USER } from "../../utils/constants/constants";
import UserRootState from "../../redux/rootstate/UserState";
import { useDispatch, useSelector } from "react-redux";
import { showToastMessage } from "../../utils/toast";
import { axiosInstance } from "../../config/api/axiosInstance";
import { logout } from '../../redux/slices/UserSlice';
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const WriteSpaceLogo: React.FC = () => (
    <Image
        src="/images/login.png"
        alt="WriteSpace Logo"
        width={36}
        height={36}
        className="cursor-pointer"
    />
);

export function WritSpaceNavbar() {
    const user = useSelector((state: UserRootState) => state.user.userData);
    const isAuthenticated = useSelector((state: UserRootState) => state.user.isUserSignedIn);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <Navbar
            maxWidth="full"
            className="bg-[#1a1a1a]"
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
        >
            {/* Menu Toggle for Mobile */}
            {isAuthenticated && (
                <NavbarContent className="sm:hidden" justify="start">
                    <NavbarMenuToggle
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        className="text-white"
                    />
                </NavbarContent>
            )}
            <NavbarBrand>
                <WriteSpaceLogo />
                <Link to={USER.HOME}> <p className="font-bold text-inherit text-white">WriteSpace</p></Link>
            </NavbarBrand>

            {/* Desktop Navigation */}
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
                                <DropdownItem key="my-blogs" onPress={() => navigate(USER.BLOGS)}>
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

            {/* Mobile Menu */}
            <NavbarMenu className="bg-[#1a1a1a] pt-6">
                {isAuthenticated && (
                    <>
                        <NavbarMenuItem>
                            <NextUILink
                                href={USER.HOME}
                                className="w-full text-white text-lg py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </NextUILink>
                        </NavbarMenuItem>
                        <NavbarMenuItem className="flex flex-col gap-2">
                            <NextUILink
                                href={USER.ALL_BLOG}
                                className="w-full text-white text-lg py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                All Blogs
                            </NextUILink>
                            <NextUILink
                                href={USER.BLOGS}
                                className="w-full text-white text-lg py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                My Blogs
                            </NextUILink>
                            <NextUILink
                                href={USER.CREATE_BLOG}
                                className="w-full text-white text-lg py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Create Blog
                            </NextUILink>
                        </NavbarMenuItem>
                        <NavbarMenuItem>
                            <NextUILink
                                href={USER.ABOUT_US}
                                className="w-full text-white text-lg py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                About Us
                            </NextUILink>
                        </NavbarMenuItem>
                    </>
                )}
            </NavbarMenu>

            {/* User Profile Section */}
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
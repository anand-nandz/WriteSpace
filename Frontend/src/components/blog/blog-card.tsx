import { Card, CardBody, CardFooter } from "@nextui-org/card"
import { Image } from "@nextui-org/image"
import { Chip } from "@nextui-org/chip"
import { Button, } from "@nextui-org/react"
import { PenIcon, Trash2 } from "lucide-react"
import { BlogCardProps } from "../../utils/interfaces/interfaces"
import { useState } from "react"
import BlogModal from "./BlogModal"
import { useSelector } from "react-redux"
import UserRootState from "../../redux/rootstate/UserState"
import { useNavigate } from "react-router-dom"
import { USER } from "../../utils/constants/constants"

export function BlogCard({ image, title, date, categories, excerpt = '', onEditClick, onDelete, isAll = false, author }: BlogCardProps) {
    const imageUrl = Array.isArray(image) ? image[0] : image
    const userIn = useSelector((state: UserRootState) => state.user.isUserSignedIn);
    
    const navigate = useNavigate()

    const [isOpen, setOpen] = useState(false);

    return (
        <Card className="relative group">
            <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                    removeWrapper
                    alt={title}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                    src={imageUrl || '/images/login.png'}
                />
                {/* Diagonal cut overlay */}
                <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-white transform translate-y-1/2 translate-x-1/2 rotate-45" />
                {isAll && (
                    <>
                        <div className="absolute top-2 right-2 flex gap-2 z-10">
                            <Button
                                isIconOnly
                                color="danger"
                                variant="light"
                                onPress={onDelete}
                                className="bg-white  bg-opacity-50 hover:bg-opacity-100"
                            >
                                <Trash2 size={18} />
                            </Button>
                        </div>
                        <div className="absolute top-2 right-14 flex gap-2 z-10">
                            <Button
                                isIconOnly
                                color="default"
                                variant="light"
                                className="bg-white bg-opacity-50 hover:bg-opacity-100"
                                onPress={onEditClick}
                            >
                                <PenIcon size={18} />
                            </Button>
                        </div>
                    </>
                )}

            </div>

            <CardBody className="p-4">
                <h2 className="text-xl font-semibold mb-2">{title}</h2>
                <div className="flex gap-2 mb-3 text-sm text-gray-500">
                    <time>{date}</time>
                    •
                    {categories.map((category) => (
                        <Chip key={category} size="sm" variant="flat" className="text-xs">
                            {category}
                        </Chip>
                    ))}
                </div>
                <p className="text-gray-600 line-clamp-2">{excerpt}</p>
            </CardBody>

            <CardFooter className="pt-0 ">
                {userIn ? (
                    <Button
                        onPress={() => setOpen(true)}
                        className="text-black font-medium uppercase text-sm tracking-wider hover:text-red-600 justify-end"
                    >
                        Read More →
                    </Button>
                ) : (
                    <Button
                        onPress={() => navigate(`${USER.LOGIN}`)}
                        className="text-black font-medium uppercase text-sm tracking-wider hover:text-red-600"
                    >
                        Read More →
                    </Button>
                )}
            </CardFooter>

            <BlogModal
                isOpen={isOpen}
                onClose={() => setOpen(false)}
                image={image}
                title={title}
                date={date ? new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) : undefined}
                categories={categories}
                excerpt={excerpt}
                author={{
                    name: author?.name,
                    email: author?.email,
                    image: author?.image,
                    contactinfo: author?.contactinfo,
                }}
            />
        </Card>


    )
}


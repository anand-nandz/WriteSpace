import { Modal, ModalContent, ModalBody, ModalHeader } from "@nextui-org/modal"
import { Image } from "@nextui-org/image"
import { Link } from "@nextui-org/link"
import { Divider } from "@nextui-org/divider"
import { Avatar } from "@nextui-org/avatar"
import { Facebook, Instagram, Mail } from 'lucide-react'
import { BlogModalProps } from "../../utils/interfaces/interfaces"
import React from "react"

export default function BlogModal({
    isOpen,
    onClose,
    title,
    image,
    date,
    categories,
    excerpt,
    author = {
        name: "Author Name",
        email: "author@example.com",
        image: "/default-avatar.png",
        contactinfo: "Contact Information"
    }
}: BlogModalProps) {
    const imageUrl = Array.isArray(image) ? image[0] : image

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="full"
            scrollBehavior="inside"
            closeButton='text-lg'
        >
            <ModalContent className="overflow-hidden">
                <ModalHeader className="flex justify-end p-4" />
                <ModalBody className="p-0">
                    <div className="relative h-[300px] sm:h-[400px]">
                        <Image
                            removeWrapper
                            alt={title}
                            className="object-cover w-full h-full"
                            src={imageUrl}
                        />
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <span key={category} className="px-3 py-1 text-sm bg-white/90 rounded-full">
                                    {category}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="px-4 sm:px-8 py-6">
                        <div className="grid grid-cols-1 sm:grid-cols-[minmax(160px,200px)_1fr] gap-8">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-center">
                                    <Avatar
                                        src={author.image}
                                        className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3"
                                        alt={author.name}
                                    />
                                    <h3 className="font-medium text-lg mb-1">{author.name}</h3>
                                    <p className="text-sm text-gray-500 mb-3">Blog Author</p>
                                </div>

                                <div className="flex justify-center gap-4 mb-4">
                                    <Link href={`mailto:${author.email}`} className="text-gray-400 hover:text-gray-600">
                                        <Mail className="w-4 h-4" />
                                    </Link>
                                    <Link href="#" className="text-gray-400 hover:text-gray-600">
                                        <Facebook className="w-4 h-4" />
                                    </Link>
                                    <Link href="#" className="text-gray-400 hover:text-gray-600">
                                        <Instagram className="w-4 h-4" />
                                    </Link>
                                </div>

                                <Divider className="my-4" />

                                <div className="text-center text-sm text-gray-500 space-y-1">
                                    <p>{author.contactinfo}</p>
                                    <p className="break-all">{author.email}</p>
                                </div>

                                <div className="text-center mt-4">
                                    <Link href={`/author/${author.email}`} className="text-sm text-primary">
                                        View all posts
                                    </Link>
                                </div>
                            </div>

                            <div className="min-w-0">
                                <h1 className="text-2xl sm:text-4xl font-serif mb-2 break-words">{title}</h1>
                                {date && (
                                    <time className="text-sm text-gray-500 block mb-4">{date}</time>
                                )}
                                <div className="space-y-4 text-gray-600 leading-relaxed">
                                    <p>{excerpt?.split('\n').map((paragraph, index) => (
                                            <React.Fragment key={index}>
                                              {paragraph}
                                              <br />
                                            </React.Fragment>
                                          ))}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
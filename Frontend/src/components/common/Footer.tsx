import { Link } from "@nextui-org/link"
import { Divider } from "@nextui-org/divider"
import { Facebook, Twitter, Youtube, Phone } from 'lucide-react'
import { USER } from "../../utils/constants/constants"

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <div className="text-xl font-bold">
            WriteSpace
          </div>

          {/* Navigation */}
          <div className="flex gap-6">
            <Link href={USER.ABOUT_US} className="text-white hover:text-gray-300">
              About
            </Link>
            <Link href="/home" className="text-white hover:text-gray-300">
              Blogs
            </Link>
           
            <Link href="/home" className="text-white hover:text-gray-300">
              Support
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link href="#" className="text-white hover:text-gray-300">
              <Facebook size={20} />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="text-white hover:text-gray-300">
              <Twitter size={20} />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-white hover:text-gray-300">
              <Youtube size={20} />
              <span className="sr-only">Youtube</span>
            </Link>
            <Link href="#" className="text-white hover:text-gray-300">
              <Phone size={20} />
              <span className="sr-only">Phone</span>
            </Link>
          </div>
        </div>

        <Divider className="my-4 bg-gray-700" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-400">
          <p>© 2025  All right reserved.</p>
          <p>Support: capturecrew.connect@gmail.com</p>
        </div>
      </div>
    </footer>
  )
}


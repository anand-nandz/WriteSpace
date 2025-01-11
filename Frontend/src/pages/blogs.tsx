
import { useEffect, useRef, useState } from "react"
import { Button, Modal, ModalBody, ModalContent, Pagination } from "@nextui-org/react"
import { useNavigate } from "react-router-dom"
import { BlogData, BlogStatus } from "../utils/interfaces/interfaces";
import { BlogCategories } from "../utils/types/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BlogCard } from "../components/blog/blog-card";
import CreateBlog from "../components/blog/CreateBlog";
import { axiosInstance } from "../config/api/axiosInstance";
import { showToastMessage } from "../utils/toast";
import { useDispatch } from "react-redux";
import { setLatestBlog } from "../redux/slices/UserSlice";
import Swal from "sweetalert2";


export default function Blogs() {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const [blogs, setBlogs] = useState<BlogData[]>([])
  const [selectedService, setSelectedService] = useState<BlogCategories>(BlogCategories.ALL);
  const [currentPage, setCurrentPage] = useState(1)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPostForEdit, setSelectedPostForEdit] = useState<BlogData | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const BLOGS_PER_PAGE = 3

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get('/blogs', {
        withCredentials: true
      })
      const publishedBlogs = response.data.data.blogs
      if (Array.isArray(publishedBlogs)) {
        setBlogs(publishedBlogs)
        if (publishedBlogs.length > 0) {
          const latestBlog = publishedBlogs[0];
          console.log(latestBlog, 'Latest Blog (zeroth index)');
          dispatch(setLatestBlog(latestBlog));
        } else {
          console.log("No blogs available to set as latest.");
        }
      } else {
        console.error('Published posts is not an array:', publishedBlogs)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      if (error instanceof Error) {
        showToastMessage(error.message || 'Failed to fetch posts', 'error')
      } else {
        showToastMessage('An unknown error occurred', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filteredBlogs = selectedService === BlogCategories.ALL
    ? blogs
    : blogs.filter(blog => blog.category === selectedService); const totalBlogs = filteredBlogs.length;

  const totalPages = Math.max(1, Math.ceil(totalBlogs / BLOGS_PER_PAGE));
  const startIndex = (currentPage - 1) * BLOGS_PER_PAGE
  const endIndex = startIndex + BLOGS_PER_PAGE
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);
  console.log(currentBlogs);


  const handleEditClick = (post: BlogData) => {
    setSelectedPostForEdit(post);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedPostForEdit(null);
    setIsEditModalOpen(false);
  };
  const handleAddClick = () => {
    navigate('/create-blogs')
  }

  const handleServiceChange = (service: BlogCategories) => {
    setSelectedService(service)
    setCurrentPage(1)
  }

  const handleStatusChange = async (blogId: string | undefined, status: BlogStatus) => {
    try {
      console.log(blogId, status);
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you really want to delete this blog?`,
        icon: 'warning',
        confirmButtonText: 'Yes',
        showCancelButton: true,
        cancelButtonText: 'No',
        allowOutsideClick: false,
      });

      if (!result.isConfirmed) {
        return; 
      }

      const response = await axiosInstance.patch(`/blogs/${blogId}/status`, {
        status: status
      }, {
        withCredentials: true
      });

      const updatedBlog = response.data.data;
      console.log(updatedBlog, 'updated');

      if (status === BlogStatus.Delete) {
        setBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== blogId));
        showToastMessage('Blog deleted successfully', 'success');
      } else {
        setBlogs(prevBlogs =>
          prevBlogs.map(blog =>
            blog._id === blogId
              ? { ...blog, status: status }
              : blog
          )
        );
        showToastMessage('Blog status updated successfully', 'success');
      }
    } catch (error) {
      console.error("Error updating blog status:", error);
      if (error instanceof Error) {
        showToastMessage(error.message || 'Failed to update blog status', 'error');
      } else {
        showToastMessage('An unknown error occurred', 'error');
      }
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      const newScrollPosition = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      })
    }
  }


  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-center">My Blogs</h1>
          <Button
            onClick={handleAddClick}
            className="bg-black text-white hover:bg-gray-800"
          >
            Upload New Blog
          </Button>
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
            <Button
              isIconOnly
              variant="light"
              className="bg-white/80 backdrop-blur-sm shadow-sm"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex space-x-4 overflow-x-hidden scroll-smooth py-4 px-8"
          >
            {Object.values(BlogCategories).map((service) => (
              <Button
                key={service}
                onClick={() => handleServiceChange(service)}
                variant={selectedService === service ? "solid" : "light"}
                className={`px-6 py-2 rounded-full whitespace-nowrap min-w-fit ${selectedService === service
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                size="sm"
              >
                {service}
              </Button>
            ))}
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
            <Button
              isIconOnly
              variant="light"
              className="bg-white/80 backdrop-blur-sm shadow-sm"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500"></div>
          </div>
        ) : (
          <>
            {currentBlogs.filter(blog => blog.status !== BlogStatus.Delete).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No blogs found for {selectedService}</p>
                <p className="text-gray-500 my-3">Check back later for updates</p>
                <Button
                  onClick={handleAddClick}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Upload New Blog
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {currentBlogs.map((blog) => (
                  blog.status !== BlogStatus.Delete && (
                    <BlogCard
                      key={blog._id}
                      image={blog.imageUrl}
                      title={blog.title}
                      date={blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : undefined}
                      categories={[blog.category]}
                      excerpt={blog.description}
                      blogId={blog._id}  // Changed from blog.blogId to blog._id
                      onEditClick={() => handleEditClick(blog)}
                      onDelete={() => handleStatusChange(blog._id, BlogStatus.Delete)}
                      isAll={true}
                      author={{
                        name: blog.userId.name,
                        email: blog.userId.email,
                        image: blog.userId.image,
                        contactinfo: blog.userId.contactinfo,
                      }}
                    />
                  )
                ))}
              </div>
            )}
          </>
        )}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              total={totalPages}
              initialPage={1}
              page={currentPage}
              onChange={setCurrentPage}
              showControls
              color="primary"
            />
          </div>
        )}

        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          size="3xl"
          classNames={{
            base: "bg-transparent",
            body: "bg-transparent p-0",
            closeButton: "absolute top-[45px] right-3  z-50 bg-gray-100 text-black hover:bg-gray-800 rounded-full p-1.5",
            header: "hidden",
          }}
          hideCloseButton={false}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalBody className="bg-transparent p-0">
                  <CreateBlog
                    isEditMode={true}
                    existingPost={selectedPostForEdit}
                    onClose={onClose}
                    setBlogs={setBlogs}
                  />
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>



      </main>
    </div>

  )
}


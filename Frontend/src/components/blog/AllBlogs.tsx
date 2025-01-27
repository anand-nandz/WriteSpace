import { useCallback, useEffect, useRef, useState } from "react"
import { Button, Input, Pagination } from "@nextui-org/react"
import { BlogData, BlogStatus } from "../../utils/interfaces/interfaces";
import { BlogCategories } from "../../utils/types/types";
import { axiosInstance } from "../../config/api/axiosInstance";
import { showToastMessage } from "../../utils/toast";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { BlogCard } from "./blog-card";
import { setLatestBlog } from "../../redux/slices/UserSlice";
import { useDispatch } from "react-redux";
import { debounce } from 'lodash';

export default function AllBlogs() {
  const dispatch = useDispatch()
  const [blogs, setBlogs] = useState<BlogData[]>([])
  const [selectedService, setSelectedService] = useState<BlogCategories>(BlogCategories.ALL);
  const [currentPage, setCurrentPage] = useState(1)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const BLOGS_PER_PAGE = 6

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = useCallback(async (page?: number, search?: string) => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get('/all-blogs', {
        params: {
          page: page,
          search: search,
        }
      })
      const publishedBlogs = response.data.data.blogs
      console.log(publishedBlogs, 'published');

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
  }, [])

  const debouncedFetchData = useCallback(
    debounce((page?: number, search?: string) => {
      fetchBlogs(page, search);
    }, 500),
    [fetchBlogs]
  );

  useEffect(() => {
    if (searchTerm.trim().length >= 3 || searchTerm.trim() === '') {
      debouncedFetchData(currentPage, searchTerm);
    }
    return () => {
      debouncedFetchData.cancel();
    };
  }, [currentPage, searchTerm, debouncedFetchData]);



  const filteredBlogs = blogs
    .filter(blog => blog.status === BlogStatus.Published)
    .filter(blog =>
      selectedService === BlogCategories.ALL ? true : blog.category === selectedService
    );

  const totalBlogs = filteredBlogs.length;
  const totalPages = Math.max(1, Math.ceil(totalBlogs / BLOGS_PER_PAGE));
  const startIndex = (currentPage - 1) * BLOGS_PER_PAGE
  const endIndex = startIndex + BLOGS_PER_PAGE
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  const handleServiceChange = (service: BlogCategories) => {
    setSelectedService(service)
    setCurrentPage(1)
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
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
    <>
      <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold"> All Blogs</h1>
          </div>
          <div className="relative max-w-2xl mx-auto my-6">
            <Input
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search blogs..."
              startContent={
                <Search className="text-2xl text-default-400 pointer-events-none flex-shrink-0" size={20} />
              }
              radius="lg"
              classNames={{
                base: "max-w-full",
                mainWrapper: "h-11",
                input: "text-small",
                inputWrapper: "h-11 py-2 rounded-full border-1 border-default-200 bg-gradient-to-b from-white to-default-100 hover:border-default-400 focus:border-default-700 dark:from-default-50 dark:to-default-100",
              }}
            />
            <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-r from-violet-600/30 via-blue-600/30 to-cyan-600/30 opacity-10 blur-xl" />
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
              className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-8 snap-x snap-mandatory"
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
          ) : currentBlogs.filter(blog => blog.status !== BlogStatus.Delete).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No blogs found for {selectedService}</p>
              <p className="text-gray-500 my-3">Check back later for updates</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 px-6">
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
                      blogId={blog.blogId}
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
        </main>
      </div>
    </>
  )
}

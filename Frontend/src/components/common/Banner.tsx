import { Typography } from "@material-tailwind/react";
import { useSelector } from "react-redux";
import UserRootState from "../../redux/rootstate/UserState";
import BlogModal from "../blog/BlogModal";
import { useState } from "react";
import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { USER } from "../../utils/constants/constants";
import { truncateText } from "../../utils/types/helper";


const HeroBanner = () => {
  const latestBlog = useSelector((state: UserRootState) => state.user.latestBlog);
  const userIn = useSelector((state: UserRootState) => state.user.isUserSignedIn);
  const navigate = useNavigate()
  const [isOpen, setOpen] = useState(false);
  const date = new Date(latestBlog?.createdAt || "2023-02-01");

  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative w-full h-screen flex flex-col md:flex-row">
      {/* Left Content Section - 30% */}
      <div className="relative w-full md:w-[30%] h-full bg-gray-700 p-8 flex flex-col justify-center">
        <div className="absolute top-[20%] left-[10%] w-[600px] z-20 max-w-xl bg-white p-8 shadow-xl">
          <div className="mb-6">
            <Typography
              variant="small"
              placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
              className="text-gray-500 uppercase tracking-wider mb-3 text-sm font-medium"
            >
              {`${formattedDate} • ${latestBlog?.category} •`}
            </Typography>
            <Typography
              variant="h1"
              placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
              className="text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            >
              {latestBlog?.title || 'At daybreak of the fifteenth day of my search'}
            </Typography>
            <Typography
              variant="paragraph"
              placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
              className="text-gray-700 text-lg leading-relaxed line-clamp-2 overflow-hidden whitespace-normal break-words"
            >
              {truncateText(latestBlog?.description || 'When the amphitheater had cleared I crept stealthily to the top and as the great excavation lay...')}
              </Typography>
            <Typography
              variant="h3"
              placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
              className="text-gray-700 text-lg leading-relaxed mt-4"
            >
              {userIn ? (
                <Button
                  onPress={() => setOpen(true)}
                  className="text-black font-medium uppercase text-sm tracking-wider hover:text-red-600"
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

            </Typography>
          </div>

        </div>
      </div>

      {/* Right Image Section - 70% */}
      <div className="relative w-full md:w-[70%] h-full overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${latestBlog?.imageUrl?.[0] || '/images/caro2.jpg'})`,
            filter: "brightness(0.95)"
          }}
        />
      </div>

      <BlogModal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        image={latestBlog?.imageUrl}
        title={latestBlog?.title}
        date={date ? new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : undefined}
        categories={[]}
        excerpt={latestBlog?.description}
        author={{
          name: latestBlog?.userId?.name,
          email: latestBlog?.userId?.email,
          image: latestBlog?.userId?.image,
          contactinfo: latestBlog?.userId?.contactinfo,
        }}

      />
    </div>
  );
};

export default HeroBanner;


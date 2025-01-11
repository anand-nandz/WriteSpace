import { Typography } from "@material-tailwind/react";
import { useSelector } from "react-redux";
import { useState } from "react";
import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { USER } from "../../utils/constants/constants";
import { truncateText } from "../../utils/types/helper";
import BlogModal from "../blog/BlogModal";
import UserRootState from "../../redux/rootstate/UserState";

const HeroBanner = () => {
  const latestBlog = useSelector((state: UserRootState) => state.user.latestBlog);
  const userIn = useSelector((state: UserRootState) => state.user.isUserSignedIn);
  const navigate = useNavigate();
  const [isOpen, setOpen] = useState(false);
  const date = new Date(latestBlog?.createdAt || "2023-02-01");

  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative w-full h-screen">
      <div className="md:hidden relative h-full">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${latestBlog?.imageUrl?.[0] || '/images/caro2.jpg'})`,
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center p-4">
          <div className="w-full bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-xl">
            <div className="mb-4">
              <Typography
                variant="small"
                className="text-gray-600 uppercase tracking-wider mb-2 text-sm font-medium"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                {`${formattedDate} • ${latestBlog?.category} •`}
              </Typography>
              <Typography
                variant="h1"
                className="text-2xl font-bold mb-3 text-gray-900"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                {latestBlog?.title || 'At daybreak of the fifteenth day of my search'}
              </Typography>
              <Typography
                variant="paragraph"
                className="text-gray-700 text-base leading-relaxed line-clamp-2"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                {truncateText(latestBlog?.description || 'When the amphitheater had cleared I crept stealthily to the top and as the great excavation lay...')}
              </Typography>
              <div className="mt-4">
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex w-full h-full">
        <div className="relative w-[30%] h-full bg-gray-700">
          <div className="absolute top-[20%] left-[10%] w-[600px] z-20 bg-white p-8 shadow-xl">
            <div className="mb-6">
              <Typography
                variant="small"
                className="text-gray-500 uppercase tracking-wider mb-3 text-sm font-medium"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                {`${formattedDate} • ${latestBlog?.category} •`}
              </Typography>
              <Typography
                variant="h1"
                className="text-4xl font-bold mb-4 text-gray-900"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                {latestBlog?.title || 'At daybreak of the fifteenth day of my search'}
              </Typography>
              <Typography
                variant="paragraph"
                className="text-gray-700 text-lg leading-relaxed line-clamp-2"
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
              >
                {truncateText(latestBlog?.description || 'When the amphitheater had cleared I crept stealthily to the top and as the great excavation lay...')}
              </Typography>
              <div className="mt-4">
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
              </div>
            </div>
          </div>
        </div>
        <div className="w-[70%] h-full">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${latestBlog?.imageUrl?.[0] || '/images/caro2.jpg'})`,
              filter: "brightness(0.95)"
            }}
          />
        </div>
      </div>

      <BlogModal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        image={latestBlog?.imageUrl}
        title={latestBlog?.title}
        date={formattedDate}
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
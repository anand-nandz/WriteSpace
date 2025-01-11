
import { Card, CardBody } from "@nextui-org/card"
import { Divider } from "@nextui-org/divider"
import HomeCard from "../components/common/HomeCard"
import Footer from "../components/common/Footer"

export default function AboutPage() {
    return (
        <>
            <div className="max-w-[1200px] mx-auto px-4 py-16">
                {/* Hero Section */}
                <h1 className="text-6xl font-bold tracking-tighter mb-16">
                    ABOUT US.
                </h1>

                {/* About Text Section */}
                <div className="grid md:grid-cols-[200px_1fr] gap-8 mb-16">
                    <div className="text-sm uppercase tracking-wide">
                        About us.
                        <br />
                        Our Story.
                        <br />
                        Press.
                    </div>
                    <div className="text-lg leading-relaxed text-neutral-600">
                        WriteSpace is a vibrant community of writers, thinkers, and storytellers. Founded in 2023, we've created a digital sanctuary where words come alive and ideas flow freely. Our platform celebrates diverse voices, from emerging writers to established authors, all united by their passion for authentic expression.
                    </div>
                </div>

                {/* Work Image Section */}
                <Card className="w-full mb-16 relative">
                    <CardBody className="p-0">
                        <div className="relative h-[500px]">
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />

                            {/* Content */}
                            <div className="absolute bottom-8 left-8 z-20 text-white">
                                <h1 className="text-5xl font-bold mb-4">WriteSpace</h1>
                                <div className="space-y-2">
                                    <p className="text-xl">Founded by Anand</p>
                                    <p className="text-lg opacity-80">
                                        <a
                                            href="mailto: capturecrew.connect@gmail.com"
                                            className="hover:underline"
                                        >
                                            capturecrew.connect@gmail.com
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {/* Image */}
                            <img
                                src="/images/about1.jpg"
                                alt="WriteSpace mindfulness"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                    </CardBody>
                </Card>

                <Divider className="my-16" />

                <HomeCard />


            </div>
            <Footer/>
        </>
    )
}


import { Divider } from "@nextui-org/react"

const HomeCard = () => {
    return (
        <>
            {/* Quote Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-16 px-3">
                <div className="space-y-4">
                    <p className="text-3xl font-serif italic leading-snug text-black">
                        "Every story deserves a space to breathe, every writer deserves a place to belong."
                    </p>
                    <p className="text-sm text-neutral-500">
                        - WriteSpace Manifesto
                    </p>
                    <p className="text-lg text-neutral-600 leading-relaxed">
                        We believe in the power of words to transform, connect, and inspire. Our platform isn't just a blog - it's a canvas for your thoughts, a stage for your voice, and a community that supports your creative journey. From personal essays to professional insights, WriteSpace is where your stories find their home.
                    </p>
                </div>
                <div className="justify-center pr-4">
                    <img
                        alt="Person working on wall"
                        className="w-full h-[400px] object-cover"
                        src="/images/about2.jpg"
                    />
                </div>
            </div>

            <Divider className="my-16" />

            <div className="grid md:grid-cols-2 gap-8 mb-16 px-3">
                <div className="justify-center">
                    <img
                        alt="Community gathering of writers"
                        className="w-full h-[400px] object-cover"
                        src="/images/home2.jpg"
                    />
                </div>
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold mb-4">Our Values</h2>
                    <div className="space-y-6">
                        <p className="text-lg text-neutral-600 leading-relaxed">
                            <span className="font-semibold">Authenticity:</span> We encourage writers to find and express their unique voice, free from constraints.
                        </p>
                        <p className="text-lg text-neutral-600 leading-relaxed">
                            <span className="font-semibold">Community:</span> Writing may be solitary, but growth happens together. We foster meaningful connections between writers.
                        </p>
                        <p className="text-lg text-neutral-600 leading-relaxed">
                            <span className="font-semibold">Quality:</span> We maintain high standards while remaining inclusive, helping writers reach their full potential.
                        </p>
                    </div>
                </div>

            </div>
        </>
    )
}

export default HomeCard
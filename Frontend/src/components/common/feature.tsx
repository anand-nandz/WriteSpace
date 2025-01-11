
import { Card } from "@nextui-org/card"
import { Image } from "@nextui-org/image"
import { Accordion, AccordionItem } from "@nextui-org/accordion"
import { ChevronDown, Edit, Share } from 'lucide-react'

const features = [
  {
    key: "blog",
    icon: <ChevronDown className="text-primary w-6 h-6" />,
    title: "Blog beautifully",
    content: "Customize your blog's look and feel in a couple of clicks with beautifully designed themes. Bring your writing to life with magical drag-and-drop layouts. Or put your fingerprint on every font, color, and element on the page."
  },
  {
    key: "edit",
    icon: <Edit className="text-primary w-6 h-6" />,
    title: "Edit easily",
    content: "Transform your thoughts into beautifully formatted posts with our intuitive editor. Add images, format text, and structure your content exactly how you want it. Writing has never been this seamless."
  },
  {
    key: "share",
    icon: <Share className="text-primary w-6 h-6" />,
    title: "Share anything, simply",
    content: "Share your stories with the world effortlessly. Whether it's photos, thoughts, or creative works, our platform makes it simple to reach your audience and build your community."
  }
]

export default function FeatureSection() {
  return (
    <section className="py-16 px-4 md:px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-serif mb-8">WriteSpace</h2>
            <Card className="bg-white/50 backdrop-blur-sm border-none shadow-sm">
              <Accordion 
                defaultExpandedKeys={["blog"]}
                selectionMode="multiple"
                className="p-2"
              >
                {features.map((feature) => (
                  <AccordionItem
                    key={feature.key}
                    aria-label={feature.title}
                    startContent={feature.icon}
                    title={
                      <h3 className="text-2xl font-serif">{feature.title}</h3>
                    }
                    className="py-2"
                  >
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {feature.content}
                    </p>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </div>

          <div className="relative">
            <div className="relative h-[600px] rounded-2xl overflow-hidden">
              <Image
                src="/images/home1.jpg?height=600&width=800"
                alt="Person taking a photo from a balcony"
                className="object-cover w-full h-full"
                radius="lg"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary/10 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}



import { Card } from "@nextui-org/card"
import { Image } from "@nextui-org/image"
import { Accordion, AccordionItem } from "@nextui-org/accordion"
import { ChevronDown, Edit, Share } from 'lucide-react'

const features = [
  {
    key: "blog",
    icon: <ChevronDown className="text-primary w-6 h-6" />,
    title: "AI-Powered Blogging",
    content: "Leverage the power of AI to help you create stunning blogs effortlessly. Get tailored suggestions, beautifully designed themes, and advanced customization options to make your blog uniquely yours."
  },
  {
    key: "edit",
    icon: <Edit className="text-primary w-6 h-6" />,
    title: "Smart Editing Made Simple",
    content: "Seamlessly edit your blogs with AI-assisted tools. Add images, format content, and structure your posts with precision. Let AI handle the details while you focus on your creativity."
  },
  {
    key: "share",
    icon: <Share className="text-primary w-6 h-6" />,
    title: "Effortless Sharing and Discovery",
    content: "Share your blogs across platforms with just a click. Use advanced search and filtering options to find, categorize, and connect with the content and audience that matter most to you."
  }
];


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
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary/10 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}


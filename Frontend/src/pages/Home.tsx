
import HeroBanner from '../components/common/Banner';
import AllBlogs from '../components/blog/AllBlogs';
import HomeCard from '../components/common/HomeCard';
import Footer from '../components/common/Footer';

const Home = () => {
  
  return (
    <>
    <HeroBanner/>
    <AllBlogs/>
    <div className="max-w-[1200px] mx-auto px-4 py-16">
    <HomeCard/>
    </div>
    <Footer/>
    
    </>
  )
}

export default Home
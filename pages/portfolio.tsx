import linkedin_image from "@/public/assets/images/linkedin.png";
import Image from "next/image";
import twitter_image from "@/public/assets/images/twitter.png";
import Link from "next/link";
import github_image from "@/public/assets/images/github.png";
import whatsapp_image from "@/public/assets/images/whatsapp.png";
import profile_pic from "@/public/assets/images/logo.png";
import Navbar from "@/components/Navbar";
import { FaThumbsUp } from "react-icons/fa"; // Import the like icon
import ReviewFormModal from "@/components/ReviewForm";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import React, { useState } from 'react'; // Make sure React is imported


// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


export default function About() {
  const linkedinUrl = "https://www.linkedin.com/in/creative-programmer";
  const githubUrl = "https://www.github.com/ahmedmujtaba1";
  const twitterUrl = "https://twitter.com/Ahmed_Mujtaba69";
  const whatsappUrl =
    "https://api.whatsapp.com/send/?phone=923312269636&text&type=phone_number&app_absent=0";


  const [open, setOpen] = useState(false); // State to manage modal visibility
  const [liked, setLiked] = useState(false); // State to track if the like button was clicked

  const handleOpen = () => setOpen(true); // Open modal
  const handleClose = () => setOpen(false); // Close modal

  const handleLikeClick = () => {
    setLiked((prevLiked) => !prevLiked); // Toggle like state on click
  };

// Portfolio card data
const portfolioData = [
    {
      title: "Web Development Project",
      description:
        "A responsive website built using React and Tailwind CSS. Focused on performance and user experience.",
      image: "/assets/images/profile.png",
      link: "https://www.example.com/project1",
    },
    {
      title: "Mobile App Design",
      description:
        "A user-friendly mobile app design for e-commerce platforms with smooth navigation and user interface.",
      image: "/assets/images/profile.png",
      link: "https://www.example.com/project2",
    },
    {
      title: "Blockchain-Based Application",
      description:
        "A decentralized application (DApp) built using Ethereum and Solidity, demonstrating smart contract interaction.",
      image: "/assets/images/profile.png",
      link: "https://www.example.com/project3",
    },
  ];
    // Line chart data for two graphs
    const lineChartData1 = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
          {
            label: "Website Traffic",
            data: [65, 59, 80, 81, 56, 55, 40, 85, 92, 78, 110, 130],
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: true,
          },
        ],
      };
    
      const lineChartData2 = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
          {
            label: "Sales Revenue",
            data: [150, 120, 100, 170, 130, 110, 140, 160, 180, 190, 210, 230],
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: true,
          },
        ],
      };
    
    

  return (
    <div id="about" className="w-fill md:h-screen p-2 items-center">
        <section className="relative px-5 py-10 space-y-16 text-white sm:p-10">
          <Navbar />

        </section>
      <div className="max-w-[1240px] m-auto md:grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <h1 className="text-4xl font-bold mb-4 ">About Me</h1>
          <p>
            <span className="font-bold custom-class text-3xl">❝</span>
            My name is Ahmed Mujtaba Mohsin, and I m excited to share my success
            story with you. When I was just 12 years old, I enrolled in two
            courses - RPA and Hardware - at a local institute in my area that
            provides free courses exclusively for Dhoraji Memon students.
            Despite my young age, I was determined to make the most of my summer
            vacation and learn as much as I could about these topics. When I
            arrived for my first class, my teachers were surprised to see
            someone so young in their class. Although I only had a basic
            understanding of Python that I had learned in school, I was eager to
            learn more. My instructor, Sir Salman, was impressed by my
            enthusiasm and dedication to learning. Over the next four months, I
            worked hard to absorb as much information as possible and apply it
            to my coursework. My classmates, who were university and college
            students, also encouraged and motivated me throughout the program.
            When the course ended, I was thrilled to learn that Sir Salman was
            interested in having some of his students work under him. I was one
            of the few selected for this opportunity, and it was a tremendous
            honour to be recognized for my hard work and dedication. Today, I am
            proud to say that I have continued to learn and grow in my career. I
            am grateful for the opportunities that have come my way and for the
            support of my family, teachers, and classmates who have helped me
            along the way. I have become a Python Developer, Web Developer, and
            Backend Developer. 
            <span className="font-bold custom-class text-3xl">❞</span>

          </p>
            {/* Row containing button and like icon */}
            <div className="flex items-center justify-between mt-6">
            {/* Button to open dialog */}
            <button
                className="px-5 py-2 bg-blue-500 text-white rounded-full"
                onClick={handleOpen}
            >
                Open Form
            </button>

            {/* Like icon */}
            <div
                className={`cursor-pointer text-2xl ${liked ? "text-blue-500" : "text-gray-500"}`}
                onClick={handleLikeClick}
            >
                <FaThumbsUp />
            </div>
            </div>



          {/* ContactFormModal component */}
          <ReviewFormModal open={open} onClose={handleClose} />

          <div className="flex items-center justify-between max-w-[330px] m-auto py-4">
            <Link href={linkedinUrl} target="_blank" rel="noopener noreferrer">
              <div className="w-14 h-14 mb-4 rounded-full shadow-lg shadow-gray-400 cursor-pointer hover:scale-110 ease-in duration-300 flex items-center justify-center">
                <div className="flex h-10 w-10 place-content-center">
                  <Image src={linkedin_image} alt="LinkedIn Logo" />
                </div>
              </div>
            </Link>
            <Link href={githubUrl} target="_blank" rel="noopener noreferrer">
              <div className="w-14 h-14 mb-4 rounded-full shadow-lg shadow-gray-400 cursor-pointer hover:scale-110 ease-in duration-300 flex items-center justify-center">
                <div className="flex h-10 w-10 place-content-center">
                  <Image src={github_image} alt="Github Logo" />
                </div>
              </div>
            </Link>
            <Link href={twitterUrl} target="_blank" rel="noopener noreferrer">
              <div className="w-14 h-14 mb-4 rounded-full shadow-lg shadow-gray-400 cursor-pointer hover:scale-110 ease-in duration-300 flex items-center justify-center">
                <div className="flex h-10 w-10 place-content-center">
                  <Image src={twitter_image} alt="Twitter Logo" />
                </div>
              </div>
            </Link>
            <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <div className="w-14 h-14 mb-4 rounded-full shadow-lg shadow-gray-400 cursor-pointer hover:scale-110 ease-in duration-300 flex items-center justify-center">
                <div className="flex h-10 w-10 place-content-center">
                  <Image src={whatsapp_image} alt="Whatsapp Logo" />
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="w-full h-auto m-auto shadow-xl shadow-gray-400 rounded-xl flex items-center justify-center p-4 hover:scale-105 ease-in duration-300">
          <Image src={profile_pic} alt={"Profile Picture"} width={1300} />
        </div>
      </div>
      
       {/* Portfolio Section */}
       <section className="max-w-[1240px] m-auto py-16">
        <h2 className="text-3xl font-bold text-center mb-8">My Portfolio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioData.map((project, index) => (
            <div
              key={index}
              className="rounded-xl shadow-xl hover:scale-105 ease-in duration-300"
            >
              <Link href={project.link} target="_blank" rel="noopener noreferrer">

                <div className="p-4 bg-white rounded-b-xl">
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <p className="text-gray-600 mt-2">{project.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
      {/* Line Graph Section */}
      <section className="max-w-[1240px] m-auto py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-xl shadow-xl p-4">
            <h3 className="text-xl font-semibold text-center mb-4">Website Traffic</h3>
            <Line data={lineChartData1} />
          </div>
          <div className="rounded-xl shadow-xl p-4">
            <h3 className="text-xl font-semibold text-center mb-4">Sales Revenue</h3>
            <Line data={lineChartData2} />
          </div>
        </div>
      </section>
    </div>
  );
}

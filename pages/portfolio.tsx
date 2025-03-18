import { FC, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaThumbsUp } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Candidate {
  id:string,
  name: string;
  no: number;
  party: string;
  slogan: string;
  image: string;
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    whatsapp?: string;
  };
  bio: {
    dob?: string;
    nationality?: string;
    religion?: string;
    maritalStatus?: string;
    netWorth?: string;
  };
  education: string[];
  experience: string[];
  voteDataPresidential: number[];
  voteDataParliament: number[];
}

interface CandidatePortfolioProps {
  candidate: Candidate;
}

const CandidatePortfolio: FC<CandidatePortfolioProps> = ({ candidate }) => {
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const commentSectionRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    commentSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLikeClick = () => {
    setLiked((prevLiked) => !prevLiked);
  };

  const handlePostComment = () => {
    if (newComment.trim() === "") return;
    setComments([...comments, newComment]);
    setNewComment("");
  };

  const lineChartData1 = {
    labels: ["1999", "2005", "2010", "2015", "2019", "2024"],
    datasets: [
      {
        label: "Presidential Election Votes",
        data: [65, 59, 80, 81, 56, 55, 40, 85, 92, 78, 110, 130],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  const lineChartData2 = {
    labels: ["2000", "2001", "2004", "2010", "2015", "2020", "2024"],
    datasets: [
      {
        label: "Parliament Election Votes",
        data:[150, 120, 100, 170, 130, 110, 140, 160, 180, 190, 210, 230],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div id="about" style={{ padding: "20px" }}>
      <div className="max-w-[1240px] m-auto md:grid grid-cols-3 gap-8">
        <div className="col-span-2">
          <h1 className="text-4xl font-bold mb-4">Hello, I’m {candidate.name}</h1>
          <h2 className="text-xl font-bold mb-4">{candidate.party}</h2>
          <p className="text-xl">
            <span className="font-bold text-3xl">❝</span>
            {candidate.slogan}
            <span className="font-bold text-3xl">❞</span>
          </p>

          <div className="flex items-center justify-between mt-6">
            <button className="px-5 py-2 bg-blue-500 text-white rounded-full" onClick={handleOpen}>
              Review Me
            </button>
            <div className={`cursor-pointer text-2xl ${liked ? "text-blue-500" : "text-gray-500"}`} onClick={handleLikeClick}>
              <FaThumbsUp />
            </div>
          </div>

          {/* Social Media Links */}
          {/* <div className="flex items-center justify-between max-w-[330px] m-auto py-4">
            {candidate.socialLinks.linkedin && (
              <Link href={candidate.socialLinks.linkedin} target="_blank">
                <Image src="/assets/images/linkedin.png" alt="LinkedIn" width={40} height={40} />
              </Link>
            )}
            {candidate.socialLinks.github && (
              <Link href={candidate.socialLinks.github} target="_blank">
                <Image src="/assets/images/github.png" alt="GitHub" width={40} height={40} />
              </Link>
            )}
            {candidate.socialLinks.twitter && (
              <Link href={candidate.socialLinks.twitter} target="_blank">
                <Image src="/assets/images/twitter.png" alt="Twitter" width={40} height={40} />
              </Link>
            )}
            {candidate.socialLinks.whatsapp && (
              <Link href={candidate.socialLinks.whatsapp} target="_blank">
                <Image src="/assets/images/whatsapp.png" alt="WhatsApp" width={40} height={40} />
              </Link>
            )}
          </div> */}
        </div>
        <div className="w-full h-auto m-auto shadow-xl rounded-xl flex items-center justify-center p-4">
          <Image src={candidate.image} alt="Profile Picture" width={500} height={500} />
        </div>
      </div>

      {/* Portfolio Section */}
      <section className="max-w-[1240px] m-auto py-16">
        <h2 className="text-3xl font-bold text-center mb-8">My Portfolio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="rounded-xl shadow-xl p-4 bg-white">
            <h3 className="text-xl font-bold text-black">Bio Data</h3>
            <ul className="text-gray-600 mt-2 space-y-2">
            <li><strong>Date of Birth:</strong> {candidate.bio?.dob || "N/A"}</li>
            <li><strong>Nationality:</strong> {candidate.bio?.nationality || "N/A"}</li>
            <li><strong>Religion:</strong> {candidate.bio?.religion || "N/A"}</li>
            <li><strong>Marital Status:</strong> {candidate.bio?.maritalStatus || "N/A"}</li>
            <li><strong>Estimated Networth:</strong> {candidate.bio?.netWorth || "N/A"}</li>

            </ul>
          </div>

          <div className="rounded-xl shadow-xl p-4 bg-white">
            <h3 className="text-xl font-bold text-black">Education</h3>
            <ul className="text-gray-600 mt-2 space-y-2">
                {(candidate.education || []).map((edu, idx) => (
                  <li key={idx}>{edu}</li>
                ))}
            </ul>

          </div>

          <div className="rounded-xl shadow-xl p-4 bg-white">
            <h3 className="text-xl font-bold text-black">Experience</h3>
            <ul className="text-gray-600 mt-2 space-y-2">
              {(candidate.experience || []).map((exp, idx) => (
                <li key={idx}>{exp}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Voting History Charts */}
      <section className="max-w-[1240px] m-auto py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Voting History</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-xl shadow-xl p-4 bg-white">
            <h3 className="text-xl font-semibold text-black">Presidential Elections</h3>
            <Line data={lineChartData1} />
          </div>
          <div className="rounded-xl shadow-xl p-4 bg-white">
            <h3 className="text-xl font-semibold text-black">Parliament Elections</h3>
            <Line data={lineChartData2} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default CandidatePortfolio;

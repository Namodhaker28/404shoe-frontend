import React from "react";
import namo from "../public/namo.jpeg";
import Image from "next/image";

const About = () => {
  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <section className="about-section">
        <div className="container">
          <div className="about-image">
            <Image src={namo} />
          </div>

          <div className="info">
            <h2 className="text-white">
              <span className="text-cyan-400">[</span>Namo Narayan Dhaker <span className="text-cyan-400">]</span>
            </h2>
            <p className="about-text text-gray-300">
              Frameworks provided the magic wand for handling complexity, and
              Agile methodologies orchestrated the symphony of development.
              Amidst late-night epiphanies. Hackathons sparked
              innovation, and ethical coding became a guiding principle.
            </p>
            <p className="about-text text-gray-300">
            Full-stack mastery brought together frontend finesse and backend logic, while databases became the pulse of creations.
            </p>
            <div class="social-media-icons">
              <a href="#">
                <i class="fa-brands fa-facebook"></i>
              </a>
              <a href="#">
                <i class="fa-brands fa-github"></i>
              </a>
              <a href="#">
                <i class="fa-brands fa-linkedin"></i>
              </a>
              <a href="#">
                <i class="fa-brands fa-twitter"></i>
              </a>
              <a href="#">
                <i class="fa-brands fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

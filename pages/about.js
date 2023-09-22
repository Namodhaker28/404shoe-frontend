import React from "react";
import namo from "../public/namo.jpeg";
import Image from "next/image";

const About = () => {
  return (
    <div>
      <section class="about-section">
        <div class="container">
          <div class="about-image">
            <Image src={namo} />
          </div>

          <div class="info">
            <h2>
              <span>[</span>Namo Narayan Dhaker <span>]</span>
            </h2>
            <p class="about-text">
              Frameworks provided the magic wand for handling complexity, and
              Agile methodologies orchestrated the symphony of development.
              Amidst late-night epiphanies. Hackathons sparked
              innovation, and ethical coding became a guiding principle.
            </p>
            <p class="about-text">
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

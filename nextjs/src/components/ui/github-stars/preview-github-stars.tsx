"use client";

import { useEffect, useState } from "react";
import { GithubStarsButton } from "./github-stars";
import { githubLink } from "~/lib/links";
interface GitHubRepoResponse {
  stargazers_count: number;
}

export default function PreviewGithubStars() {
  const [stars, setStars] = useState(0);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const apiUrl = githubLink.replace("github.com", "api.github.com/repos");
        const response = await fetch(apiUrl);
        if (!response.ok) {
          console.error("Failed to fetch stars:", response.statusText);
          return;
        }
        const data = (await response.json()) as GitHubRepoResponse;
        setStars(data.stargazers_count);
      } catch (error) {
        console.error("Error fetching stars:", error);
      }
    };

    void fetchStars();
  }, []);

  return (
    <GithubStarsButton href={githubLink} starNumber={stars}>
      Star on GitHub
    </GithubStarsButton>
  );
}

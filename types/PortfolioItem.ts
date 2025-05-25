export interface PortfolioItem
    {
      id: string;
      title:  string;
      no:number;
      description:  string;
      party: string;
      image:  string;
      date:  string;
      name: string;
      slogan: string;
      profileImage: string;
      socialLinks: {
        linkedin: string;
        github: string;
        twitter: string;
        whatsapp: string;
      };
      bio: {
        dob: string;
        nationality: string;
        religion: string;
        maritalStatus: string;
        netWorth: string;
      };
      education: [];
      experience: [];
      voteDataPresidential: number[];
      voteDataParliament: number[];
      nationalId:string,
      electionId:string
    }
type CandidateType = {
    _id: string; // <-- this will now be available
    name?: string;
    no?: string;
    image?: string;
    party?: string;
    nationalId?: string;
    slogan?: string;
    profileImage?: string;
    role?: "candidate";
    electionId?: string;
    is_active?: boolean;
    bio?: {
      description?: string;
      dob?: string;
      nationality?: string;
      religion?: string;
      maritalStatus?: string;
      netWorth?: string;
    };
    socialLinks?: {
      linkedin?: string;
      github?: string;
      twitter?: string;
      whatsapp?: string;
    };
    education?: string[];
    experience?: string[];
  };
  
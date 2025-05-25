type Vote = {
    candidateId: string;
    priority1: number;
    priority2: number;
    priority3: number;
  };
  
  type PollingManager = {
    pollingManagerId: string;
    votes: Vote[];
  };
  
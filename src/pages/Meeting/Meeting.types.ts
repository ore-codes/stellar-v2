import { RemoteTrackPublication } from 'livekit-client';

export type TrackInfo = {
  trackPublication: RemoteTrackPublication;
  participantIdentity: string;
};

export type JoinMeetingRes = {
  participant: Omit<Participant, 'user'>;
  token: string;
  meeting: Meeting;
};

type Meeting = {
  id: string;
  title: string;
  code: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  durationInSecs: number;
  description: any;
  participants: Participant[];
};

type Participant = {
  id: string;
  meetingId: string;
  userId: string;
  joinTime: string;
  durationInSecs: number;
  user: {
    username: string;
  };
};

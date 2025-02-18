import {
  LocalVideoTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
} from 'livekit-client';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AudioComponent from '@/components/AudioComponent';
import Button from '@/components/Button/Button.tsx';
import VideoComponent from '@/components/VideoComponent';
import { Page } from '@/constants/pages.ts';
import { apiClient } from '@/lib/api/axios.ts';
import { useApiRequest } from '@/lib/api/useApiRequest.ts';
import { authService } from '@/lib/auth/AuthService.ts';
import { Env } from '@/lib/config.ts';
import useRxState from '@/lib/storage/useRxState.ts';

import { JoinMeetingRes, TrackInfo } from './Meeting.types.ts';

function Meeting() {
  const { code } = useParams<{ code: string }>();
  const [meeting, setMeeting] = useState<JoinMeetingRes['meeting']>();
  const user = useRxState(authService.userStorage.data$);
  const [room, setRoom] = useState<Room>();
  const [localTrack, setLocalTrack] = useState<LocalVideoTrack>();
  const [remoteTracks, setRemoteTracks] = useState<TrackInfo[]>([]);
  const apiRequest = useApiRequest<JoinMeetingRes>();
  const navigate = useNavigate();

  const usernameFromId = useCallback(
    (userId: string) => {
      return meeting.participants.find((p) => p.userId === userId)?.user.username;
    },
    [meeting]
  );

  useEffect(() => {
    apiRequest.makeRequest(apiClient.put('meetings/join', { code })).subscribe(async (res) => {
      if (res) {
        const room = new Room()
          .on(RoomEvent.TrackSubscribed, handleTrackSubscribe)
          .on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribe)
          .on(RoomEvent.Disconnected, leaveRoom);

        setRoom(room);
        setMeeting(res.meeting);

        try {
          await room.connect(Env.LiveKitUrl, res.token);
          await room.localParticipant.enableCameraAndMicrophone();
          setLocalTrack(
            room.localParticipant.videoTrackPublications.values().next().value.videoTrack
          );
        } catch (error) {
          console.log('There was an error connecting to the room:', (error as Error).message);
          console.error(error);
          await leaveRoom();
        }
      }
    });
  }, []);

  const handleTrackSubscribe = (
    _track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) => {
    setRemoteTracks((prev) => [
      ...prev,
      { trackPublication: publication, participantIdentity: participant.identity },
    ]);
    if (meeting) {
      apiRequest.makeRequest(apiClient.get(`meetings/${code}`)).subscribe((res) => {
        if (res) {
          setMeeting(res.meeting);
        }
      });
    }
  };

  const handleTrackUnsubscribe = (_track: RemoteTrack, publication: RemoteTrackPublication) => {
    setRemoteTracks((prev) =>
      prev.filter((track) => track.trackPublication.trackSid !== publication.trackSid)
    );
  };

  const leaveRoom = async () => {
    await room?.disconnect();
    setRoom(undefined);
    setLocalTrack(undefined);
    setRemoteTracks([]);
    navigate(Page.Dashboard);
    apiRequest.makeRequest(apiClient.put('meetings/leave', { code }));
  };

  return (
    <>
      {!room ? (
        <div>Loading...</div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="flex w-full max-w-7xl items-center justify-between py-5">
            <h2 className="text-2xl font-bold">{meeting.title}</h2>
            <Button variant="ghost" className="text-danger" onClick={leaveRoom}>
              Leave Room
            </Button>
          </div>
          <div className="grid h-full w-full max-w-7xl grid-cols-[repeat(auto-fit,minmax(150px,1fr))] items-center justify-center gap-2 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
            {localTrack && (
              <VideoComponent
                track={localTrack}
                participantIdentity={usernameFromId(user.id)}
                local={true}
              />
            )}
            {remoteTracks.map((remoteTrack) =>
              remoteTrack.trackPublication.kind === 'video' ? (
                <VideoComponent
                  key={remoteTrack.trackPublication.trackSid}
                  track={remoteTrack.trackPublication.videoTrack!}
                  participantIdentity={usernameFromId(remoteTrack.participantIdentity)}
                />
              ) : (
                <AudioComponent
                  key={remoteTrack.trackPublication.trackSid}
                  track={remoteTrack.trackPublication.audioTrack!}
                />
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Meeting;

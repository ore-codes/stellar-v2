import { LocalVideoTrack, RemoteVideoTrack } from 'livekit-client';
import { FC, useEffect, useRef } from 'react';

type VideoComponentProps = {
  track: LocalVideoTrack | RemoteVideoTrack;
  participantIdentity: string;
  local?: boolean;
};

const VideoComponent: FC<VideoComponentProps> = ({ track, participantIdentity, local = false }) => {
  const videoElement = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoElement.current) track.attach(videoElement.current);

    return () => {
      track.detach();
    };
  }, [track]);

  return (
    <div className="relative aspect-video-portrait overflow-hidden rounded-xl bg-dark md:aspect-video">
      <div className="absolute left-2 top-2">
        <p className="rounded-xl bg-light px-2 font-bold text-placeholder">
          {participantIdentity + (local ? ' (You)' : '')}
        </p>
      </div>
      <video ref={videoElement} id={track.sid} className="size-full"></video>
    </div>
  );
};

export default VideoComponent;

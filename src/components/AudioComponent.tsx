import { LocalAudioTrack, RemoteAudioTrack } from 'livekit-client';
import { FC, useEffect, useRef } from 'react';

type AudioComponentProps = {
  track: LocalAudioTrack | RemoteAudioTrack;
};

const AudioComponent: FC<AudioComponentProps> = ({ track }) => {
  const audioElement = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioElement.current) track.attach(audioElement.current);

    return () => {
      track.detach();
    };
  }, [track]);

  return <audio ref={audioElement} id={track.sid} />;
};

export default AudioComponent;
